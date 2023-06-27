const PetModel = require('../models/PetModel');


async function getAllPets() {
    return PetModel.find({}).populate('owner').lean();
    // return Play.find({ isPublic: true }).sort({ cratedAt: -1 }).lean();
    // показваме само isPublic да се вижда в Каталога и ги сортираме по най-новите създадени
}

async function getProductAndBidsID(userId) {
    return PetModel.findById(userId).populate('owner').populate('bidder').lean();
}

async function getPetById(petId) {
    return PetModel.findById(petId).populate('comments.user').lean();
}

async function getByOwner(userId) {
    return PetModel.find({ owner: userId }).lean();
}


async function createPet(petData) {
    // const result = await Play.create({ ...playData, owner: ownerId });

    // Проверка за недублиране на имена на заглавията
    const pattern = new RegExp(`^${petData.name}$`, 'i');
    const existing = await PetModel.findOne({ name: { $regex: pattern } });

    if (existing) {
        throw new Error('A Pet with this name already exists');
    }

    const result = new PetModel(petData);
    await result.save();
    return result;
}

async function editPet(petId, currEditedPet) {
    const existing = await PetModel.findById(petId);

    existing.name = currEditedPet.name;
    existing.image = currEditedPet.image;
    existing.age = currEditedPet.age;
    existing.description = currEditedPet.description;
    existing.location = currEditedPet.location;

    return existing.save();

    // same as above
    // await Game.findByIdAndUpdate(gameId, gameData);
    // findByIdAndUpdate - заобикаля валидациите
}


async function deleteById(petId) {
    return PetModel.findByIdAndDelete(petId);
}


async function addComment(petId, commentData) {
    const pet = await PetModel.findById(petId);
    pet.comments.push(commentData)
    return pet.save();

    // same as
    // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
}


async function buyGame(userId, gameId) {
    const game = await PetModel.findById(gameId);
    game.boughtBy.push(userId);
    return game.save();

    // same as
    // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
}



async function makeABidder(productId, userId) {
    const existing = await PetModel.findById(productId);

    if (existing.bidder.includes(userId)) {
        throw new Error('Cannot Bid twice');
    }

    existing.bidder.push(userId);
    return existing.save();
}

async function placeBid(productId, amount, userId) {
    const existingProduct = await PetModel.findById(productId);

    if (existingProduct.bidder == userId) {
        throw new Error('You are already the highest bidder');
    } else if (existingProduct.owner == userId) {
        throw new Error('You cannot bid for your own auction!');
    } else if (amount <= existingProduct.price) {
        throw new Error('Your bid must be higher than the current price');
    }

    existingProduct.bidder = userId;
    existingProduct.price = amount;

    await existingProduct.save();
}

async function closeAuction(id) {
    const existingProduct = await PetModel.findById(id);

    if (!existingProduct.bidder) {
        throw new Error('Cannot close auction without bidder!');
    }

    existingProduct.closed = true;
    await existingProduct.save();
}

async function getAuctionsByUser(userId) {
    return PetModel.find({ owner: userId, closed: true }).populate('bidder').lean();
}


module.exports = {
    createPet,
    getAllPets,
    getPetById,
    deleteById,
    editPet,
    addComment,
    getByOwner
};






// async function sortByLikes(orderBy) {
//     return ProductModel.find({ isPublic: true }).sort({ usersLiked: 'desc' }).lean();
// }



// async function buyGame(userId, gameId) {
//     const game = await Play.findById(gameId);
//     game.buyers.push(userId);
//     return game.save();

//     // same as
//     // Game.findByIdAndUpdate(gameId, { $push: { buyers: userId } });
// }





// async function search(cryptoName, paymentMethod) {
//     let crypto = await Game.find({}).lean();

//     if(cryptoName) {
//         crypto = crypto.filter(x => x.cryptoName.toLowerCase() == cryptoName.toLowerCase())
//     }

//     if(paymentMethod) {
//         crypto = crypto.filter(x => x.paymentMethod == paymentMethod)
//     }

//     return crypto;
// }
