let uploadDialogVisible = false;

let uploadForm = {
    uploadPayAcctPass: '',
};

let beforeUpload = async function (imgFile) {
    const isJPEG = imgFile.type === 'image/jpeg';
    const isPNG = imgFile.type === 'image/png';
    const isBMP = imgFile.type === 'image/bmp';
    const isLt10M = imgFile.size / 1024 / 1024 < 10;
    if (!(isJPEG || isPNG || isBMP)) {
        this.$message.error('Picture must be JPG/PNG/BMP format!');
    }
    if (!isLt10M) {
        this.$message.error('Picture size can not exceed 10MB!');
    }
    return (isJPEG || isBMP || isPNG) && isLt10M;
};

let unlockWalletAccount = async function () {
    let b58_address = this.settingForm.b58AddressSelected;
    let password = this.uploadForm.uploadPayAcctPass;
    let url = Flask.url_for('account_change');
    try {
        let response = await axios.post(url, {'b58_address_selected': b58_address, 'password': password});
    }
    catch (error) {
        this.$message({
            message: error.response.data.result,
            type: 'error',
            duration: 2400
        });
        this.uploadDialogVisible = false;
        return
    }
    let is_unlock = await this.isDefaultWalletAccountUnlock();
    if (is_unlock === true) {
        this.$refs.upload.submit();
    }
    this.uploadForm.uploadPayAcctPass = '';
    this.uploadDialogVisible = false;
};

let submitUpload = async function () {
    let is_unlock = await this.isDefaultWalletAccountUnlock();
    if (is_unlock === true) {
        this.$refs.upload.submit();
    }
    else {
        this.uploadDialogVisible = true;
    }
};

let handleUploadSuccess = async function (response, file, fileList) {
    console.log(response);
    console.log(file);
};

let handleUploadError = async function (err, file, fileList) {
    this.$message({
        message: JSON.parse(err.message)['result'],
        type: 'error',
        showClose: true
    });
    this.$refs.upload.submit();
};