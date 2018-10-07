let Ethplorer = require('ethplorer-js').Ethplorer;
let api = new Ethplorer();

exports.get_tokens = (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if(!req.query) {
        return res.status(400).send({
            message: "Parameters can not be empty"
        });
    } else {
        var address = req.query.address;
        api.getAddressInfo(address)
        .then(data => {
            if("error" in data){
                res.status(500).json(data) 
            } else {
                res.status(200).json(data) 
            }
        })
        .catch(err => {
            res.status(500).json(err) 
        })
    }
};
