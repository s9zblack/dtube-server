const Type = require('../models/Type')

const addType = async(req, res) => {
    const {name} = req.body;
    if(!name){
        return res.status(404).json({success:false, message:'Missing name!'})
    }
    try{
        const newType = new Type({
            name
        })
        await newType.save();
        return res.json({success:true, type:newType})
    }catch(err)
    {
        return res.status(500).json({success:false, message:'Internal server'})
    }
}

const getAllType = async(req, res) => {
    try{
        const type = await Type.find().sort("-createdAt");
        return res.json({success:true, type})
    }catch(err)
    {
        return res.status(500).json({success:false, message:'Internal server'})
    }
}

module.exports = {
    addType,getAllType
}