const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const server = express();
const path = require("path");
// var key = require("./firebase-admin.json");
const firebase = require("./database");
const { get } = require("http");
const firestore = firebase.firestore();
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: false }));
server.use(cors());

const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://127.0.0.1:${PORT}`);
});

server.get("/user", async function (request, response) {
    let body = request.body;
    try {
        let querySnapshot = (await firestore.collection(body.collectionName).get()).docs.map(value => {
            let temp = value.data();
            return temp;
        });
        response.send(querySnapshot);
    }catch(err){
        console.log(err)
    }

});

server.get("/user/:id", async function (request, response) {
    let params = request.params.id;
    console.log(params);
    let querySnapshot = await firestore.collection("User").doc(params);
    let datas = await querySnapshot.get().then((value) => {
        let temp = value.data()
        console.log(temp)
        return temp;
    });
    response.send(datas);
});


server.post("/user", async (request, response) => {
    let body = request.body;
    console.log(body);
    let collectionName = body.collectionName;
    console.log(collectionName)
    let docId = body.data.docId;
    try {
        let isExits = await firebase.firestore().collection(collectionName).doc(docId).get();
        if (isExits.data() == undefined) {
            await firebase.firestore().collection(collectionName).doc(docId).set(body.data);
            response.send({
                message: "Successful!!!",
            });
        } else {
            return response.status(400).send({
                message: "User is exits!"
            })
        }
    } catch (error) {
        console.log(error);
    }

});
// user location
server.post("/user/location", async (request, response) => {
    let temp = request.body.data;
    try {
        // let isExits = await firebase.firestore().collection(temp.collectionName).doc(temp.docId).get();
        // if (isExits.data() != undefined) {
        firebase.firestore().collection(temp.collectionName).doc(temp.docId).update({
            Location: temp.Location
        }).then((value) => {
            console.log('value' + value);
        }).catch((error) => {
            console.log(error);
        });
        // return response.send({
        //     message: "Update location !!!"
        // })
        // }
        //   return response.status(400).send({
        //     message: "User is exits!"
        // })

    } catch (err) {
        console.log(err);
    }
})
server.put("/user/update", async (request, response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
    console.log(collectionName, docId);
    try {
        let result = await firestore.collection(collectionName)
            .doc(docId)
            .update(request.body.data);
        console.log(result);
        response.send({
            message: "Update successful!!",
            updateTime: result.writeTime,
        })
    } catch (error) {
        response.send({
            error: error.toString(),
        });
    }
});

///LikeList
server.post("/user/likelist", async (request, response) => {
    let collectionName = request.body.data.collectionName;
    let docId = request.body.data.docId; ////nguoi dung
    let docIDs = request.body.data.docIDs; ////nguoi dung duoc thich 
    console.log(docId, docIDs)
    // let isExits = await firebase.firestore().collection(collectionName).doc(docIDs).get();
    await firebase.firestore().collection(collectionName).doc(docId).update({
        Like: firebase.firestore.FieldValue.arrayUnion(docIDs)
    });

    await firebase.firestore().collection(collectionName).doc(docIDs).update({
        Watting: firebase.firestore.FieldValue.arrayUnion(docId)
    });


    response.send({
        message: "Like"
    })

})
////////UnLikeList
server.post("/user/unlikelist", async (request, response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
    let docIDs = request.body.docIDs;
    await firebase.firestore().collection(collectionName).doc(docId).update({
        unLike: firebase.firestore.FieldValue.arrayUnion(docIDs)
    });
    await firebase.firestore().collection(collectionName).doc(docId).update({
        Watting: firebase.firestore.FieldValue.arrayRemove(docIDs)
    });
    response.send({
        message: "UnLike"
    })

})

///////get LikeList
server.get("/user/listLike", async (request, response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
    console.log(collectionName, docId);
    let result = await firebase.firestore().collection(collectionName).doc(docId).get().then((value) => {
        let temp = value.data().Like;
        console.log(temp)
    });
    response.send(result)
})

/////get Unlistlike

server.get("/user/listLike", async (request, response) => {
    let collectionName = request.body.collectionName;
    let docId = request.body.docId;
    console.log(collectionName, docId);
    let result = await firebase.firestore().collection(collectionName).doc(docId).get().then((value) => {
        let temp = value.data().UnLike;
        console.log(temp)
    });
    response.send(result)
})



// server.post("/user/unlike", async(request, response)=>{
//   let collectionName = request.body.collectionName;
//   let docId = request.body.docId;
//   let docIDs =  request.body.docIDs;
//    await firebase.firestore().collection(collectionName).doc(docId).update({
//       UnLike : firebase.firestore.FieldValue.arrayUnion(docIDs)
//   });
// })