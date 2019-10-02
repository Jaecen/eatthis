import { inject, injectable } from "inversify"
import * as Mongo from 'mongodb'
import SERVICE_IDENTIFIERS from '../dependencies/serviceIdentifiers'
import config from '../environments/config'
import User from '../models/user'
import RandomNumberGenerator from '../services/randomNumberGenerator'
import IAccountRepository from './IAccountRepository'

const url = 'mongodb://localhost:27017'
const dbName = config.database.name
const collectionName = 'users'

@injectable()
export default class AccountRepository implements IAccountRepository {

    private randomNumberGenerator: RandomNumberGenerator

    public constructor(@inject(SERVICE_IDENTIFIERS.RandomNumberGenerator) randomNumberGenerator: RandomNumberGenerator) {
        this.randomNumberGenerator = randomNumberGenerator
    }

    public login(email: string, password: string): Promise<User> {
        return new Promise<User>((resolve, reject) => {

            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }

            Mongo.MongoClient.connect(url, options, async (connectError, client) => {

                if (connectError) {
                    reject(connectError)
                    return
                }

                const user = await client
                    .db(dbName)
                    .collection(collectionName)
                    .findOne({ "email": email })

                if (!user) {
                    resolve(null)
                    return
                }

                if (user.password !== password) {
                    resolve(null)
                    return
                }

                resolve({
                    email: user.email,
                    firstName: user.firstName,
                    id: user.id,
                    lastName: user.lastName,
                    password: user.password
                })
            })
        })
    }
    
    public register(user: User) : Promise<User> {
        return new Promise((resolve, reject) => {

            const options = {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }

            Mongo.MongoClient.connect(url, options, async (connectError, client) => {

                if (connectError) {
                    reject(connectError)
                    return
                }

                const record = {
                    email: user.email,
                    firstName: user.firstName,
                    id: this.randomNumberGenerator.generateGuid(),
                    lastName: user.lastName,
                    password: user.password
                }

                await client
                    .db(dbName)
                    .collection(collectionName)
                    .insertOne(record)

                resolve(record)
            })
        })
    }
}