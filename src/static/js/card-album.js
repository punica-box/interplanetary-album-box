let viewOriginalImg = async function (item) {
    window.open(_blank = item);
};

let shareIpfsAddress = async function (item) {
    try {
        this.$alert(item.split("/")[3].split(".")[0], 'IPFS Address', {
            confirmButtonText: 'OK',
        });
    } catch (error) {
        console.log(error);
    }
};
