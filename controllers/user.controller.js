const MD5             = require("md5");
const UserModel       = require("../models/user.model");
const { checkFields } = require("../helpers/index.helper");


class UserController {
    #req;
    #res;

    constructor(req, res){
        this.#req = req;
        this.#res = res;
    }

    login = async () => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let check_fields = checkFields(["email_address", "password"], this.#req.body);

            if(check_fields.status){
                let user = await UserModel.getUser("email_address = ? AND password = ?", [check_fields.result.email_address, MD5(check_fields.result.password)]);

                if(user.status && user.result.length){
                    this.#req.session.user = {
                        user_id: user.result[0].id,
                        first_name: user.result[0].first_name
                    }
                    this.#req.session.save();

                    response_data.status = true;
                }
                else{
                    response_data.error = "Incorrect login";
                }
            }
            else{
                response_data = check_fields;
            }
        }
        catch(error){
            response_data.error = error;
        }

        this.#res.json(response_data);
    }

    register = async () => {
        let response_data = { status: false, result: {}, error: null };

        try{
            let check_fields = checkFields(["first_name", "last_name", "email_address", "password"], this.#req.body);

            if(check_fields.status){
                let user = await UserModel.getUser("email_address = ?", [check_fields.result.email_address]);

                if(user.status && user.result.length){
                    response_data.error = "Email address already exist."
                }
                else{
                    let create_user = await UserModel.createUser({ ...check_fields.result, password: MD5(check_fields.result.password) });

                    if(create_user.status){
                        response_data.status = true;
                    }
                    else{
                        response_data.error = create_user.error;
                        //response_data.error = "Error encountered while creating a user";
                    }
                }
            }
            else{
                response_data = check_fields;
            }
        }
        catch(error){
            response_data.error = error;
        }

        this.#res.json(response_data);
    }
}

module.exports = UserController;
