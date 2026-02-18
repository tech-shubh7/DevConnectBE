const validator = require("validator")


const validateSignupData = (req) => {

    const { firstName, lastName, emailId, password } = req.body;

    if (!(firstName || lastName)) {
        throw new Error("Name is not valid! Please enter correct name..")
    } else if (!validator.isEmail(emailId)) {
        throw new Error("email is not valid!!")
    }
    else if (password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,32}$/;
        if (!regex.test(password)) {
            throw new Error("Password must be 8-32 characters and include uppercase, lowercase, number, and special character.");

        }
    };
}

const validateEditProfileData = (req) => {
    const allowedEditFields = [
        "firstName",
        "lastName",
        "age",
        "gender",
        "profilePicture",
        "bio",
        "skills"
    ]

    const isEditAllowed = Object.keys(req.body).every((field) => allowedEditFields.includes(field));

    return isEditAllowed;

}

module.exports = { validateSignupData, validateEditProfileData }