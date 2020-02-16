function clean( num ) {
    if ( typeof num == "string") {
        num = num.replace(",","");
        num = num.replace("$","")
    }
    if (!isNaN(num)) return parseFloat(num)
    else return 0;
}

function comma(num ) {
    const str = num.toString().split('.');
    if (str[0].length >= 4) {
        str[0] = str[0].replace(/(\d)(?=(\d{3})+$)/g, '$1,');
    }
    if (str[1] && str[1].length >= 4) {
        str[1] = str[1].replace(/(\d{3})/g, '$1 ');
    }
    return "$" + str.join('.');
}

export default { clean, comma }