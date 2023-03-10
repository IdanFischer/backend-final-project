import { ObjectId } from "mongodb";
import { mongo_creds } from "../secrets.js";
import { dbConnect } from "./dbConnect.js";

const collection_anime = mongo_creds.COLLECTION_ANIME

// --------------------- GET DATE ---------------------

export function getAnimesByDate(req, res) {
  const db = dbConnect();
  const collection = db.collection(collection_anime)
  collection.find().sort({ createdAt: -1 }).toArray()
    .then(docs => {
      const anime = docs.map(doc => ({ ...doc }))
      res.send(anime)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.message })
    });
}

// --------------------- GET RATING ---------------------

export function getAnimesByRating(req, res) {
  const db = dbConnect();
  const collection = db.collection(collection_anime)
  collection.find({ rating: { $regex: /^[0-9]+:/ } }) // filter by rating values
    .sort({ rating: -1 }) // sort in descending order
    .toArray()
    .then(docs => {
      const anime = docs.map(doc => ({ ...doc }))
      res.send(anime)
    })
    .catch(err => {
      console.error(err)
      res.status(500).json({ error: err.message })
    });
}

// --------------------- ADD ---------------------

export function addAnime(req, res) {
  const { title, info, rating, review, image } = req.body
  if ((title.length < 1 || info.length < 1 || rating.length < 1 || review.length < 1 || image.length < 1)) {
    res.status(500).json({ message: "Input Fields are empty or too short!" })
    return
  }
  const newAnime = { title, info, rating, review, image, createdAt: new Date() }
  const db = dbConnect()
  db.collection(collection_anime).insertOne(newAnime)
    .then(res.status(201).json({ message: 'Worked!' }))
    .catch(err => res.status(500).json({ error: err.message }))
}


// --------------------- UPDATE IF DATE---------------------

export function updateAnimeDate(req, res) {
  const { animeId } = req.params
  const db = dbConnect()

  db.collection(collection_anime)
    .findOneAndUpdate({ _id: new ObjectId(animeId) }, { $set: req.body })
    .then(() => getAnimesByDate(req, res))
    .catch(err => res.status(500).json({ error: err.message }))
  // res.status(202).send({message: "Comment Updated!"})
}

// --------------------- UPDATE IF Rating---------------------

export function updateAnimeRating(req, res) {
  const { animeId } = req.params
  const db = dbConnect()

  db.collection(collection_anime)
    .findOneAndUpdate({ _id: new ObjectId(animeId) }, { $set: req.body })
    .then(() => getAnimesByRating(req, res))
    .catch(err => res.status(500).json({ error: err.message }))
  // res.status(202).send({message: "Comment Updated!"})
}


// --------------------- DELETE IF DATE ---------------------

export function deleteAnimeDate(req, res) {
  const { animeId } = req.params

  const db = dbConnect()
  db.collection(collection_anime)
    .findOneAndDelete({ _id: new ObjectId(animeId) })
    .then(() => getAnimesByDate(req, res))
    .catch(err => res.status(500).json({ error: err.message }))
}

// --------------------- DELETE IF RATING ---------------------

export function deleteAnimeRating(req, res) {
  const { animeId } = req.params

  const db = dbConnect()
  db.collection(collection_anime)
    .findOneAndDelete({ _id: new ObjectId(animeId) })
    .then(() => getAnimesByRating(req, res))
    .catch(err => res.status(500).json({ error: err.message }))
}
