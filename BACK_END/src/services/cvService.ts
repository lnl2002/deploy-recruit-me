import CV, { ICV } from '../models/cvModel'

const cvService = {
    getListCV: async (): Promise<ICV[] | []> => {
        const listCV = await CV.find({})
        return listCV
    },
}

export default cvService
