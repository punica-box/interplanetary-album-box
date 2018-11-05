new Vue({
    el: '#vue-app',
    data: function () {
        return {
            labelPosition: 'right',
            uploadDialogVisible: uploadDialogVisible,
            uploadForm: uploadForm,
            unlockDialogVisible: true,
            isSwitchToSettings: true,
            albumArray: [],
            eventInfoSelect: eventInfoSelect,
            eventKey: eventKey,
            assetSelect: assetSelect,
            assetKey: assetKey,
            settingForm: settingForm
        }
    },
    methods: {
        beforeUpload: beforeUpload,
        submitUpload: submitUpload,
        unlockWalletAccount: unlockWalletAccount,
        handleUploadSuccess: handleUploadSuccess,
        handleUploadError: handleUploadError,
        viewOriginalImg: viewOriginalImg,
        shareIpfsAddress: shareIpfsAddress,
        getAccounts: getAccounts,
        queryBalance: queryBalance,
        queryEvent: queryEvent,
        getIdentities: getIdentities,
        importAccount: importAccount,
        removeAccount: removeAccount,
        createAccount: createAccount,
        clearNewAccountHexPrivateKey: clearNewAccountHexPrivateKey,
        clearNewIdentityHexPrivateKey: clearNewIdentityHexPrivateKey,
        createIdentity: createIdentity,
        importIdentity: importIdentity,
        removeIdentity: removeIdentity,
        accountChange: accountChange,
        identityChange: identityChange,
        networkChange: networkChange,
        changeContract: changeContract,
        getContractAddress: getContractAddress,
        isDefaultWalletAccountUnlock: isDefaultWalletAccountUnlock,
        getDefaultAccountData: getDefaultAccountData,
        getDefaultIdentityData: getDefaultIdentityData,
        async getAlbumArray() {
            let url = Flask.url_for('get_album_array');
            try {
                let response = await axios.get(url);
                this.albumArray = response.data.result;
            } catch (error) {
                console.log(error);
            }
        },
        async tabClickHandler(tab, event) {
            if (tab.label === 'DApp Settings') {
                if (this.isSwitchToSettings === true) {
                    this.isSwitchToSettings = false;
                    await this.getAccounts();
                    await this.getIdentities();
                    await this.getContractAddress();
                    await this.getDefaultAccountData();
                    await this.getDefaultIdentityData();
                }
            }
            else if (tab.label === 'Collapse Album') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
                await this.getIdentities();
                await this.getAlbumArray();
            }
            else if (tab.label === 'Card Album') {
                this.isSwitchToSettings = true;
                await this.getAccounts();
                await this.getIdentities();
                await this.getAlbumArray();
            }
            else {
                this.isSwitchToSettings = true;
            }
        }
    },
    async created() {
        await this.getAlbumArray();
        await this.getAccounts();
        await this.getDefaultAccountData();
        await this.getDefaultIdentityData();
    }
});
