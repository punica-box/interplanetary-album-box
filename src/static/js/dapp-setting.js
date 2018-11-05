let settingForm = {
    networkOptions: [{
        value: 'MainNet',
        label: 'Main Network',
    }, {
        value: 'TestNet',
        label: 'Polaris Test Network'
    }, {
        value: 'Localhost',
        label: 'Localhost 20336'
    }],
    newAccountHexPrivateKey: '',
    newAccountPrivateKeyDialogVisible: false,
    newIdentityPrivateKeyDialogVisible: false,
    newIdentityHexPrivateKey: '',
    networkSelected: ['TestNet'],
    accountOptions: [],
    accountSelected: [],
    b58AddressSelected: '',
    identityOptions: [],
    identitySelected: [],
    ontIdSelected: '',
    contractAddress: '',
};

let getContractAddress = async function () {
    let url = Flask.url_for('get_contract_address');
    let response = await axios.get(url);
    this.settingForm.contractAddress = response.data.result;
};

let isDefaultWalletAccountUnlock = async function () {
    let url = Flask.url_for('is_default_wallet_account_unlock');
    try {
        let response = await axios.get(url);
        return response.data.result;
    } catch (error) {
        console.log(error);
        return false;
    }
};

let getDefaultAccountData = async function () {
    let url = Flask.url_for('get_default_wallet_account_data');
    try {
        let response = await axios.get(url);
        let default_b58_address = response.data.b58_address;
        this.settingForm.accountSelected = [default_b58_address];
        this.settingForm.b58AddressSelected = default_b58_address;
    } catch (error) {
        console.log(error);
    }
};

let getDefaultIdentityData = async function () {
    let url = Flask.url_for('get_default_identity_data');
    try {
        let response = await axios.get(url);
        let default_ont_id = response.data.ont_id;
        this.settingForm.ontIdSelected = default_ont_id;
        this.settingForm.identitySelected = [default_ont_id];
    } catch (error) {
        console.log(error);
    }
};

let changeContract = async function () {
    let hex_contract_address = await this.$prompt('Paste your oep4 contract address here:', 'Change Contract', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /^[a-zA-Z0-9]{40}$/,
        inputErrorMessage: 'Cannot handle invalid contract address'
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    try {
        let change_contract_url = Flask.url_for('set_contract_address');
        let response = await axios.post(change_contract_url, {
            'contract_address': hex_contract_address
        });
        this.$message({
            type: 'success',
            message: 'change contract address successful!',
            duration: 2000
        });
        await this.getContractAddress();
    } catch (error) {
        console.log(error);
    }
};

let getAccounts = async function () {
    let url = Flask.url_for('get_accounts');
    let response = await axios.get(url);
    this.settingForm.accountOptions = [];
    for (let i = 0; i < response.data.result.length; i++) {
        this.settingForm.accountOptions.push({
            value: response.data.result[i].b58_address,
            label: response.data.result[i].label
        });
    }
};

let importAccount = async function () {
    let hex_private_key = await this.$prompt('Paste your private key string here:', 'Import Account', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /^[a-zA-Z0-9]{64}$/,
        inputErrorMessage: 'Cannot import invalid private key'
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (hex_private_key === undefined) {
        return;
    }
    let label = await this.$prompt('Account Label:', 'Import Account', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (label === undefined) {
        return;
    }
    let password = await this.$prompt('Account Password', 'Import Account', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputType: 'password',
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (password === undefined) {
        return;
    }
    try {
        let import_account_url = Flask.url_for('import_account');
        let import_account_response = await axios.post(import_account_url, {
            'hex_private_key': hex_private_key.value,
            'label': label.value,
            'password': password.value
        });
        await this.getAccounts();
        this.$message.success({
            message: 'Import successful',
            duration: 1200
        });
    }
    catch (error) {
        if (error.response.status === 409) {
            this.$message({
                message: error.response.data.result,
                type: 'error',
                duration: 2400
            })
        }
    }
};

let createAccount = async function () {
    let label = await this.$prompt('Account Label:', 'Import Account', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /\S{1,}/,
        inputErrorMessage: 'invalid label'
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (label === undefined) {
        return;
    }
    let password = await this.$prompt('Account Password', 'Import Account', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /\S{1,}/,
        inputType: 'password',
        inputErrorMessage: 'invalid password'
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (password === undefined) {
        return;
    }
    try {
        let create_account_url = Flask.url_for('create_account');
        let response = await axios.post(create_account_url, {
            'label': label.value,
            'password': password.value
        });
        this.settingForm.newAccountHexPrivateKey = response.data.hex_private_key;
        this.settingForm.newAccountPrivateKeyDialogVisible = true;
        await this.getAccounts();
    } catch (error) {
        console.log(error);
    }
};

let removeAccount = async function () {
    let password = '';
    try {
        password = await this.$prompt('Account Password', 'Remove Default Account', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            inputPattern: /\S{1,}/,
            inputType: 'password',
            inputErrorMessage: 'invalid password'
        });
        password = password.value;
    } catch (error) {
        this.$message({
            message: 'remove account canceled',
            type: 'warning',
            duration: 800
        });
    }
    if (password === '') {
        return;
    }
    try {
        let remove_account_url = Flask.url_for('remove_account');
        let response = await axios.post(remove_account_url, {
            password: password,
            b58_address_remove: this.settingForm.accountSelected[0],
        });
        await this.getAccounts();
        if (this.settingForm.accountOptions.length !== 0) {
            let firstB58Address = this.settingForm.accountOptions[0].value;
            this.settingForm.accountSelected = [firstB58Address];
            this.settingForm.b58AddressSelected = firstB58Address;
        }
        this.$message({
            message: response.data.result,
            type: 'success',
            duration: 2400
        });
    } catch (error) {
        this.$message({
            message: error.response.data.result,
            type: 'error',
            duration: 2400
        })
    }
};

let accountChange = async function (value) {
    let password = '';
    try {
        password = await this.$prompt('Account Password', 'Change Default Account', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            inputPattern: /\S{1,}/,
            inputType: 'password',
            inputErrorMessage: 'invalid password'
        });
        password = password.value;
    } catch (error) {
        this.$message({
            message: 'remove account canceled',
            type: 'warning',
            duration: 800
        });
    }
    if (password === '') {
        return;
    }
    try {
        let url = Flask.url_for('account_change');
        let response = await axios.post(url, {'b58_address_selected': value[0], 'password': password});
        this.settingForm.b58AddressSelected = value[0];
        this.$message({
            type: 'success',
            message: response.data.result,
            duration: 1200
        });
    }
    catch (error) {
        this.$message({
            message: error.response.data.result,
            type: 'error',
            duration: 2400
        })
    }
};

let clearNewAccountHexPrivateKey = async function () {
    this.settingForm.newAccountHexPrivateKey = ''
};

let getIdentities = async function () {
    try {
        let url = Flask.url_for('get_identities');
        let response = await axios.get(url);
        this.settingForm.identityOptions = [];
        for (let i = 0; i < response.data.result.length; i++) {
            this.settingForm.identityOptions.push({
                value: response.data.result[i].ont_id,
                label: response.data.result[i].label
            });
        }
    }
    catch (error) {
        console.log(error);
    }
};

let createIdentity = async function () {
    let label = await this.$prompt('Identity Label:', 'Create Identity', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /\S{1,}/,
        inputErrorMessage: 'invalid label'
    }).catch(() => {
        this.$message.warning('Create canceled');
    });
    if (label === undefined) {
        return;
    }
    let password = await this.$prompt('Identity Password', 'Create Account', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /\S{1,}/,
        inputType: 'password',
        inputErrorMessage: 'invalid password'
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (password === undefined) {
        return;
    }
    try {
        let create_identity_url = Flask.url_for('create_identity');
        let response = await axios.post(create_identity_url, {
            'label': label.value,
            'password': password.value
        });
        this.settingForm.newIdentityHexPrivateKey = response.data.hex_private_key;
        this.settingForm.newIdentityPrivateKeyDialogVisible = true;
        await this.getIdentities();
    } catch (error) {
        console.log(error);
    }
};

let clearNewIdentityHexPrivateKey = async function () {
    this.settingForm.newIdentityHexPrivateKey = ''
};

let importIdentity = async function () {
    let hex_private_key = await this.$prompt('Paste your private key string here:', 'Import Identity', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputPattern: /^[a-zA-Z0-9]{64}$/,
        inputErrorMessage: 'Cannot import invalid private key'
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (hex_private_key === undefined) {
        return;
    }
    let label = await this.$prompt('Identity Label:', 'Import Identity', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (label === undefined) {
        return;
    }
    let password = await this.$prompt('Identity Password', 'Import Identity', {
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        inputType: 'password',
    }).catch(() => {
        this.$message.warning('Import canceled');
    });
    if (password === undefined) {
        return;
    }
    try {
        let import_identity_url = Flask.url_for('import_identity');
        let import_identity_response = await axios.post(import_identity_url, {
            'hex_private_key': hex_private_key.value,
            'label': label.value,
            'password': password.value
        });
        await this.getIdentities();
        this.$message.success({
            message: 'Import successful',
            duration: 1200
        });
    } catch (error) {
        if (error.response.status === 409) {
            this.$message({
                message: error.response.data.result,
                type: 'error',
                duration: 2400
            })
        }
    }
};

let removeIdentity = async function () {
    let password = '';
    try {
        password = await this.$prompt('Identity Password', 'Remove Default Identity', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            inputPattern: /\S{1,}/,
            inputType: 'password',
            inputErrorMessage: 'invalid password'
        });
        password = password.value;
    } catch (error) {
        this.$message({
            message: 'Remove default identity canceled',
            type: 'warning',
            duration: 800
        });
    }
    try {
        let remove_identity_url = Flask.url_for('remove_identity');
        let response = await axios.post(remove_identity_url, {
            password: password,
            ont_id_remove: this.settingForm.identitySelected[0],
        });
        await this.getIdentities();
        if (this.settingForm.identityOptions.length !== 0) {
            let firstOntId = this.settingForm.identityOptions[0].value;
            this.settingForm.identitySelected = [firstOntId];
            this.settingForm.ontIdSelected = firstOntId;
        }
        this.$message({
            message: response.data.result,
            type: 'success',
            duration: 2400
        });
    } catch (error) {
        this.$message({
            message: error.response.data.result,
            type: 'error',
            duration: 2400
        })
    }
};

let identityChange = async function (value) {
    let password = '';
    try {
        password = await this.$prompt('Identity Password', 'Change Default Identity', {
            confirmButtonText: 'OK',
            cancelButtonText: 'Cancel',
            inputPattern: /\S{1,}/,
            inputType: 'password',
            inputErrorMessage: 'invalid password'
        });
        password = password.value;
    } catch (error) {
        this.$message({
            message: 'Change identity canceled',
            type: 'warning',
            duration: 800
        });
    }
    if (password === '') {
        return;
    }
    try {
        let url = Flask.url_for('identity_change');
        let response = await axios.post(url, {'ont_id_selected': value[0], 'password': password});
        this.settingForm.ontIdSelected = value[0];
        this.$message({
            type: 'success',
            message: response.data.result,
            duration: 1200
        })
    } catch (error) {
        console.log(error);
        this.$message({
            message: error.response.data.result,
            type: 'error',
            duration: 2400
        })
    }
};

let networkChange = async function (value) {
    let msg = '';
    if (value[0] === 'MainNet') {
        msg = 'Connecting to Main Network'
    }
    else if (value[0] === 'TestNet') {
        msg = 'Connecting to Polaris Test Network'
    }
    else if (value[0] === 'Localhost') {
        msg = 'Connecting to Localhost'
    }
    else {
        return
    }
    let change_net_url = Flask.url_for('change_net');
    try {
        let response = await axios.post(change_net_url, {
            network_selected: value[0]
        });
        this.$notify({
            title: 'Network Change',
            type: 'success',
            message: msg,
            duration: 2000
        });
    } catch (error) {
        this.settingForm.networkSelected = ['TestNet'];
        if (error.response.status === 400) {
            this.$notify({
                title: 'Network Change',
                type: 'warning',
                message: error.response.data.result,
                duration: 2000
            })
        }
        else if (error.response.status === 409) {
            this.$notify({
                title: 'Network Change',
                type: 'warning',
                message: error.response.data.result,
                duration: 2000
            })
        }
        else if (error.response.status === 500) {
            this.$notify({
                title: 'Network Change',
                type: 'warning',
                message: error.response.data.result,
                duration: 2000
            })
        }
        else if (error.response.status === 501) {
            this.$notify({
                title: 'Network Change',
                type: 'warning',
                message: error.response.data.result,
                duration: 2000
            })
        }
        else {
            this.$notify({
                title: 'Network Change',
                type: 'error',
                message: 'Failed',
                duration: 2000
            })
        }
    }
};
