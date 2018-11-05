new Vue({
    el: '#vue-app',
    data: function () {
        return {
            loginDialogVisible: true,
            loginForm: {
                identityOptions: [],
                identitySelected: [],
                ontIdSelected: '',
                identityPass: ''
            }
        }
    },
    methods: {
        reloadLoginPage() {
            window.location.reload();
        },
        async handleLoginDialogClose(done) {
            await this.$confirm('Are you sure to close this dialog?', 'Warning', {
                confirmButtonText: 'OK',
                cancelButtonText: 'Cancel',
                type: 'warning'
            }).then(_ => {
                window.location.reload();
            }).catch(_ => {
            });
        },
        async getIdentities() {
            try {
                let url = Flask.url_for('get_identities');
                let response = await axios.get(url);
                this.loginForm.identityOptions = [];
                for (let i = 0; i < response.data.result.length; i++) {
                    this.loginForm.identityOptions.push({
                        value: response.data.result[i].ont_id,
                        label: response.data.result[i].label
                    });
                }
            }
            catch (error) {
                console.log(error);
            }
        },
        async changeToFirstIdentity() {
            if (this.loginForm.identitySelected.length === 0 && this.loginForm.identityOptions.length !== 0) {
                let firstOntId = this.loginForm.identityOptions[0].value;
                this.loginForm.identitySelected = [firstOntId];
                this.loginForm.ontIdSelected = firstOntId;
            }
        },
        async createIdentity() {
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
                this.loginForm.newIdentityHexPrivateKey = response.data.hex_private_key;
                this.loginForm.newIdentityPrivateKeyDialogVisible = true;
                await this.getIdentities();
            } catch (error) {
                console.log(error);
            }
        },
        async identityChange(value) {
            try {
                let url = Flask.url_for('identity_change');
                let response = await axios.post(url, {'ont_id_selected': value[0]});
                this.loginForm.ontIdSelected = value[0];
                this.$message({
                    type: 'success',
                    message: response.data.result,
                    duration: 3000
                })
            } catch (error) {
                this.$message({
                    message: error.response.data.result,
                    type: 'error',
                    duration: 3000
                })
            }
        },
        async login() {
            if (this.loginForm.identityPass === '') {
                this.$message({
                    type: 'error',
                    message: 'Please input password',
                    duration: 3000
                });
                return
            }
            let unlock_identity_url = Flask.url_for('unlock_identity');
            let redirect_url = '';
            try {
                let response = await axios.post(unlock_identity_url, {
                    'ont_id_selected': this.loginForm.ontIdSelected,
                    'ont_id_password': this.loginForm.identityPass
                });
                redirect_url = response.data.redirect_url;
                this.$message({
                    type: 'success',
                    message: response.data.result,
                    duration: 3000
                });
            } catch (error) {
                redirect_url = error.response.data.redirect_url;
                this.$message({
                    type: 'error',
                    message: error.response.data.result,
                    duration: 3000
                });
            }
            window.location.replace(redirect_url);
        }
    },
    async created() {
        await this.getIdentities();
        await this.changeToFirstIdentity();
    }
});