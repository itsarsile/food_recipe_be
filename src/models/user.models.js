const { Pool } = require('pg')


const createUser = (data) => {
    const { id, name, email, photo, phone, passwordHash } = data
    return Pool.query(`INSERT INTO user(id, name, email, phone, password) VALUES(${id}, '${name}', '${email}', '${photo}', '${phone}', '${passwordHash}')`)
}

const findUser = (email) => {
    return new Promise((resolve, reject) =>
        Pool.query(`SELECT * FROM user WHERE email = '${email}'`, (err, res) => {
            if (!err) {
                resolve(res)
            } else {
                reject(err)
            }
        })
    )
}

const updateUser = (data) => {
    const { id, name, email, photo, phone } = data
    return Pool.query(`UPDATE user SET name = '${name}', email = '${email}', photo = '${photo}', phone = '${phone}' WHERE id = ${id}`)
}

module.exports = {
    createUser,
    findUser,
    updateUser
}