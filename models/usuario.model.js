// IMPORTS
// * PARA USAR LOS MODELOS DE MONGOOSE
var mongoose = require("mongoose");
// * PARA VALIDAR CAMPOS UNICOS (PLUG-IN DE MONGOOSE)
var uniqueValidator = require("mongoose-unique-validator");

// DECLARAMOS EL ESQUEMA O MODELO DE MONGOOSE.
var Schema = mongoose.Schema;

// CONTROLANDO ROLES VÁLIDOS
var rolesValidos = {
  values: ["ADMIN_ROLE", "USER_ROLE"],
  message: "{VALUE} no es un rol válido o permitido"
};

// CREAMOS EL ESQUEMA DEL USUARIO
var usuarioSchema = new Schema({
  nombre: { type: String, required: [true, "El nombre es obligatorio."] },
  email: { type: String, unique: true, require: [true, "El correo es obligatorio."]},
  password: { type: String, required: [true, "El password es obligatorio."] },
  img: { type: String, required: false },
  role: { type: String, required: true, default: "USER_ROLE", enum: rolesValidos },
  google: { type: Boolean, default: false }
});

//Quita el password cuando quiera retornarse a un JSON
usuarioSchema.methods.toJSON = function() {
  let user = this;
  let userObject = user.toObject();
  delete userObject.password;
  return userObject;
};

usuarioSchema.plugin(uniqueValidator, { message: "{PATH} debe ser único" });

// EXPORTACIÓN DEL SCHEMA PARA SER USADO EN OTROS CONTEXTOS
module.exports = mongoose.model("Usuario", usuarioSchema);
