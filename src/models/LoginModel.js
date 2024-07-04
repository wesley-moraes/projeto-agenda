const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');


const LoginSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
    
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login{
    constructor(body){
        this.body = body;
        this.errors = [];
        this.user = null;
        
    }

    async login(){
        this.valida();
        if(this.errors.length > 0) return;

        this.user = await LoginModel.findOne({email: this.body.email});

        if(!this.user){
            this.errors.push('Usuário não existe.');
            return;
        }

        if(!bcryptjs.compareSync(this.body.password, this.user.password)){
            this.errors.push('Senha Invalida');
            this.user = null;
            return;
        }

    }

    async register(){
        
        this.valida(); //recebe os dados puros do formulario
        if(this.errors.length > 0) return; //Aqui é para verificar o metodo de validação

        await this.userExists();
        if(this.errors.length > 0) return; //Aqui é para outro tipo de erro, se o usuario ja existe

        const salt = bcryptjs.genSaltSync();
        this.body.password = bcryptjs.hashSync(this.body.password, salt); //Criando uma senha em Hash
        
        this.user = await LoginModel.create(this.body);
    }

    

    async userExists(){
        this.user = await LoginModel.findOne({email: this.body.email});

        if(this.user) this.errors.push('Usuário já existe!')
    }

    valida(){
        //validacao de campos
        //O e-mail precisa ser válido
        if(!validator.isEmail(this.body.email)) this.errors.push('e-mail invalido') //Se não for um email valido
        if(this.body.password.length <3 || this.body.password.length > 50){
            this.errors.push('A senha precisa ter entre 3 a 50 caracteres. ');
        }
        //A senhra precisa ter entre 3 a 50 caracteres
    }

    cleanUp(){ //É pra garantir que tudo seja uma string
        for(const key in this.body){
            if(typeof this.body[key] !== 'string'){
                this.body[key] = ''; //E o que não for, recebe uma string vazia
            }
        }
        
        this.body = { //Garantindo que os objetos terão apenas os campos que eu quero
            email: this.body.email,
            password: this.body.password
        }
    };
    
}

module.exports = Login;