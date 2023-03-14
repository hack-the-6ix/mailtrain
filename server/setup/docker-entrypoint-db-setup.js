'use strict';

const log = require('../lib/log');
const dbcheck = require('../lib/dbcheck');
const knex = require('../lib/knex');
const {getAdminId} = require("../../shared/users");
const bluebird = require('bluebird');
const bcrypt = require('bcrypt-nodejs');
const bcryptHash = bluebird.promisify(bcrypt.hash.bind(bcrypt));

async function init() {
    const args = process.argv.slice(3);

    if (args.length !== 3) {
        log.error('Usage: NODE_ENV=production node setup/docker-entrypoint-db-setup.js <admin password> <admin access token> <is password frozen>')
        return;
    }

    const passwd = args[0];
    const accessToken = args[1];
    const passwordFrozen = args[2].toLowerCase() === "true";

    await dbcheck();
    await knex.migrate.latest();

    if(!passwordFrozen) {
        const hashedPasswd = await bcryptHash(passwd, null, null);
        await knex('users').where({id: getAdminId()}).update({password: hashedPasswd});
    }

    if (accessToken !== '') {
        await knex('users').where({id: getAdminId()}).update({access_token: accessToken});
    }

    process.exit(0);
}

init().catch(err => {log.error('', err); process.exit(1); });


