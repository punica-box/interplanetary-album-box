let eventInfoSelect = '';
let eventKey = '';
let assetSelect = '';
let assetKey = '';

let queryBalance = async function () {
    let query_balance_url = Flask.url_for("query_balance");
    let response = await axios.post(query_balance_url, {
        b58_address: this.assetKey,
        asset_select: this.assetSelect
    });
    this.$notify({
        title: 'Query Success',
        message: this.assetSelect.concat(' Balance: ', response.data.result),
        type: 'success'
    });
};

let queryEvent = async function () {
    if (this.eventInfoSelect === "") {
        this.$notify({
            title: 'Query Event Error',
            type: 'warning',
            message: 'Please select an event information you want to query.',
            duration: 800
        });
        return;
    }
    if (this.eventKey.length === 0) {
        this.$notify({
            title: 'TxHash Error',
            type: 'error',
            message: 'Please input TxHash',
            duration: 800
        });
        return;
    }
    if (this.eventKey.length === 64) {
        let get_smart_contract_event_url = Flask.url_for("get_smart_contract_event");
        try {
            let response = await axios.post(get_smart_contract_event_url, {
                tx_hash: this.eventKey,
                event_info_select: this.eventInfoSelect
            });
            let result = response.data.result;
            if (result.length === 0) {
                this.$message({
                    message: 'query failed!',
                    type: 'error',
                    duration: 800
                })
            }
            else {
                if (this.eventInfoSelect === 'Notify') {
                    this.$alert(result, 'Query Result', {
                        confirmButtonText: 'OK',
                        type: 'success'
                    });
                } else {
                    this.$notify({
                        title: 'Query Result',
                        type: 'success',
                        message: result,
                        duration: 0
                    });
                }
            }
        }
        catch (error) {
            this.$message({
                message: 'query failed!',
                type: 'error',
                duration: 800
            });
        }
    }
};