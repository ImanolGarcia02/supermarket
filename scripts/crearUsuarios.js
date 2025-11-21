const mongoose = require('mongoose');
const User = require('../models/user');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_IMANOL, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});


async function crearUsuario(username, password, role) {
	try{
		const user = new User({username, password, role});
		await user.save();
		console.log("Usuario ${username} con el rol ${role}");
	}
	catch (err){
		console.log("Error al crear usuario:", err.message);
	}finally{
		mongoose.connection.close();
	}
}