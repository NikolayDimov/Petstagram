const router = require('express').Router();

// SESSION COOKIES
// const { isUser, isOwner } = require('../middleware/guards');
// const preload = require('../middleware/preload');

const { isAuth } = require('../middleware/userSession');
const { createPet, getAllPets, getPetById, deleteById, editPet, addComment, getByOwner } = require('../services/petService');
const mapErrors = require('../util/mapError');
// const preload = require('../middleware/preload');



router.get('/create', isAuth, (req, res) => {
    res.render('create', { title: 'Add Pet', data: {} });
});

router.post('/create', isAuth, async (req, res) => {
    const petData = {
        name: req.body.name,
        image: req.body.image,
        age: Number(req.body.age),
        description: req.body.description,
        location: req.body.location,
        owner: req.user._id,
    };

    try {
        // if (Object.values(gameData).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await createPet(petData);
        res.redirect('/catalog');

    } catch (err) {
        // re-render create page
        console.error(err);
        const errors = mapErrors(err);
        return res.status(400).render('create', { title: 'Add Pet', data: petData, errors });
    }
});


// CATALOG
// router.get('/catalog') -->> /catalog -> вземаме от main.hbs // browser address bar 
router.get('/catalog', async (req, res) => {
    const pets = await getAllPets();
    // console.log(pets);
    res.render('catalog', { title: 'Catalog Pets', pets });

    //SORTING by Likes and date
    // if(req.query.orderBy == 'likes') {
    //     const plays = await sortByLikes(req.query.orderBy);
    //     res.render('catalog', { title: 'Theater Catalog', plays });

    // } else {
    //     const plays = await getAllPlays();
    //     res.render('catalog', { title: 'Theater Catalog', plays });
    // }

    // рендерираме res.render('catalog') -->> вземамe от views -> catalog.hbs

    // test with empty array
    // res.render('catalog', { title: 'Shared Trips', trips: [] });
});



router.get('/catalog/:id/details', async (req, res) => {
    const currPet = await getPetById(req.params.id);
    // console.log(currPet);
    const isOwner = currPet.owner._id == req.user?._id;
    // const isBuyer = currPet.boughtBy?.some(id => id == req.user?._id);
    

    res.render('details', { title: 'Pet Details', currPet, isOwner });
});



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });



router.get('/catalog/:id/edit', isAuth, async (req, res) => {
    try {
        const currPet = await getPetById(req.params.id);
        
        if (currPet.owner._id != req.user._id) {
            throw new Error('Cannot edit Pet that you are not owner');
        }

        res.render('edit', { title: 'Edit Pet Info', currPet });

    } catch (err) {
        console.log(err.message);
        res.redirect(`/catalog/${req.params.id}/details`);
    }
    // в edit.hbs в action="/catalog/{{currGame._id}}/edit"  поставяме currGame._id, което е: _id: new ObjectId("647650d43addd63fbb6d6efd"),
});


router.post('/catalog/:id/edit', isAuth, async (req, res) => {
    const currPetOwner = await getPetById(req.params.id);
    
    if (currPetOwner.owner._id != req.user._id) {
        throw new Error('Cannot edit Pet that you are not owner');
    }

    const petId = req.params.id;
   
    const currPet = {
        name: req.body.name,
        image: req.body.image,
        age: Number(req.body.age),
        description: req.body.description,
        location: req.body.location
    };
    
    try {
        // Имаме валидация в Модела, затова не ни трябва тук
        // if (Object.values(currEditBook).some(v => !v)) {
        //     throw new Error('All fields are required');
        // }

        await editPet(petId, currPet);
        // redirect according task description
        res.redirect(`/catalog/${req.params.id}/details`);

    } catch (err) {
        console.error(err);
        const errors = mapErrors(err);
        // 2 начина да добавим _id към редактирания обект:
        // currEditBook._id = bookId;  -->> служи да подадем id в edit.hs, но там диретно трием action=""
        // currBook: Object.assign(currEditBook, { _id: req.params.id }),

        res.render('edit', { title: 'Edit Pet Info', currPet, errors });
    }

    // same as above without try-catch
    // const gameData = req.body;
    // const gameId = req.params.id;
    // await editGame(gameId, gameData);
    // res.redirect(`/catalog/${req.params.id}/details`);
});



router.get('/catalog/:id/delete', isAuth, async (req, res) => {
    const currPet = await getPetById(req.params.id);
    try {
        // console.log(currProduct);
        if (currPet.owner._id != req.user._id) {
            throw new Error('Cannot delete Pet that you are not owner');
        }

        await deleteById(req.params.id);
        res.redirect('/catalog');
    } catch (err) {
        console.log(err.message);
        res.render(`details`, { error: 'Unable to delete'});
    }
});



router.post('/catalog/:id/comments', isAuth, async (req, res) => {
    const petId = await getPetById(req.params.id);
    const { message } = req.body;
    const user = req.user._id;

    try {
        await addComment(petId, { user, message });
        res.redirect(`/catalog/${req.params.id}/details`);
    } catch (err) {
        console.log(err.message);
        res.render(`details`, { error: 'Unable to comment'});
    }
});


router.get('/profile', isAuth, async (req, res) => {
    const photos = await getByOwner(req.user._id);
    
    const photoCount = photos.length;

    res.render('profile', { title: 'Profile', photos, photoCount });
});



module.exports = router;



// router.get('/catalog/:id/buy', isAuth, async (req, res) => {
//     await buyGame(req.user._id, req.params.id);

//     res.redirect(`/catalog/${req.params.id}/details`);
// });


// router.post('/catalog/:id/bid', isAuth, async (req, res) => {
//     const productId = req.params.id;
//     const amount = Number(req.body.bidAmount);
    
//     try {
//         await placeBid(productId, amount, req.user._id);
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);
        
//     } finally {
//         res.redirect(`/catalog/${req.params.id}/details`);
//     }
// });



// router.get('/catalog/:id/close', isAuth, async (req, res) => {
//     const id = req.params.id;

//     try {
//         await closeAuction(id);
//         res.redirect('/profile');
//     } catch (err) {
//         const errors = mapErrors(err);
//         console.log(errors);

//         res.redirect(`/catalog/${req.params.id}/details`);

//     }
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.user._id);
//     // console.log(auctions);
    
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const auctions = await getAuctionsByUser(req.session.user._id);
//     res.render('profile', { title: 'Closed Auction', auctions });
// });


// router.get('/profile', isAuth, async (req, res) => {
//     const wishedBooksByUser = await getBookByUser(req.user._id);
//     // console.log(wishedBooksByUser);
//     // [
//     //     {
//     //       _id: new ObjectId("648091d0032c4e9b82cc7e62"),
//     //       title: 'Book 4 Study',
//     //       author: 'Peter Smart',
//     //       genre: 'Study',
//     //       stars: 5,
//     //       image: 'http://localhost:3000/static/image/book-4.png',
//     //       review: 'Study hard',
//     //       owner: new ObjectId("64806aec16e81be6c406baed"),
//     //       __v: 2,
//     //       usersWished: [ new ObjectId("64806822e1b2ccc415e315ef") ]
//     //     }
//     // ]

//     // Можем да добавим обекта в res.locals.името на обекта
//     // template profile -->> {{#each wishedBooks}}
//     res.locals.wishedBooks = wishedBooksByUser;
//     res.render('profile', { title: 'Profile Page'});

//     // or
//     // template profile -->> {#each user.wishedBooksByUser}}
//     // res.render('profile', {
//     //     title: 'Profile Page',
//     //     user: Object.assign({ wishedBooksByUser }, req.user)
//     // });
// });


// router.get('/search', isAuth, async (req, res) => {
//     const { cryptoName, paymentMethod } = req.query;
//     const crypto = await search(cryptoName, paymentMethod);

//     const paymentMethodsMap = {
//         "crypto-wallet": 'Crypto Wallet',
//         "credit-card": 'Credit Card',
//         "debit-card": 'Debit Card',
//         "paypal": 'PayPal',
//     };

//     const paymentMethods = Object.keys(paymentMethodsMap).map(key => ({
//         value: key, 
//         label: paymentMethodsMap[key] ,
//         isSelected: crypto.paymentMethod == key
//     }));


//     res.render('search', { crypto, paymentMethods });
// });








//-------------------------------------------------------

// console.log(pets);;
// [
//     {
//       _id: new ObjectId("6488d5e89b6e77a1b2e292ed"),
//       name: 'German Shepard',
//       image: 'http://localhost:3000/static/images/dog-on-bed.jpg',
//       age: 2,
//       description: 'Dog on bed',
//       location: 'Sofia',
//       commentList: [],
//       owner: {
//         _id: new ObjectId("6488d3a9714b144d1a6bc88e"),
//         username: 'peter',
//         email: 'peter@abv.bg',
//         hashedPassword: '$2b$10$H7H5XtS7V11rXgHepE0HqeF6AP4wmJZRO7hYo8flUXkbo6n8r3qx6',
//         __v: 0
//       },
//       __v: 0
//     }
// ]


//----------------------------------------------------------------

// router.post('/edit/:id'...
// console.log(req.body);
// {
//     start: 'Sofia',
//     end: 'Pamporovo',
//     date: '21.05.2023',
//     time: '18:00',
//     carImage: 'https://mobistatic3.focus.bg/mobile/photosmob/711/1/big1/11684336382439711_41.jpg',
//     carBrand: 'Infinity',
//     seats: '3',
//     price: '35',
//     description: 'Ski trip for the weekend.'
// }