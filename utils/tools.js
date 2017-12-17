const os = require('os')


const getMyIp = () => {
    const nets = os.networkInterfaces()
    let address = ''
    for (let key in nets) {
        let iface = nets[key]
        iface.some(obj => {
            if (iface.family === 'IPv4' && iface.address !== '127.0.0.1' && !iface.internal) {
                address = iface.address
                return true
            }
        })
    }
    return address
}

module.exports = {
    getMyIp
}