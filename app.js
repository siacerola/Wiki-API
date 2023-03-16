const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

const MONGO_URI = 'mongodb://127.0.0.1:27017/'
const dbName = 'wikiDB'
const PORT = process.env.PORT||3000

//TODO
const connDB = async () => {
    try {
        const conn = await mongoose.connect(`${MONGO_URI}${dbName}`)
        console.log(`success connect to database ${conn.connection.host}`);
    } catch (error) {
        console.log(`error :${error}`);
        process.exit(1)
    }
    
}

const articleSchema = {
    title: String,
    content:String
}

const Article = mongoose.model("Article", articleSchema)

// ///////// request all articles

app.route("/articles")
    
    .get(async (req, res) => {

        try {
            const allArticles = await Article.find({})
            // console.log(`${allArticles}`);
            res.send(allArticles)
        } catch (error) {
            // console.log(`error : ${error}`);
            res.send(error)
        }
        
    })

    .post(async (req, res) => {

        const addArticle = new Article({
            title: req.body.title,
            content:req.body.content
        })
    
        const saveArticle = await addArticle.save()
        if (saveArticle === addArticle) {
            // console.log(`article successfully saved`);
            res.send(`article successfully saved`)
        } else {
            // console.log(`cant save articles`);
            res.send(`cant save articles`)
        }
    
    })

    .delete(async (req, res) => {

        const deleteAllArticles = await Article.deleteMany({})
        if (deleteAllArticles.acknowledged === true) {
            res.send(`${deleteAllArticles.deletedCount} articles deleted status :${deleteAllArticles.acknowledged}`)
        } else {
            res.send(`${deleteAllArticles.deletedCount} atricles deleted status :${deleteAllArticles.acknowledged}`)
        }    
    
    })

// ////////////request a specifict articles

app.route("/articles/:articleTitle")
    .get(async (req, res) => {
        const articleTitle = req.params.articleTitle
        // console.log(articleTitle);
        const findArticle = await Article.findOne({
            title:articleTitle
        }).exec()

        // console.log(findArticle.title);
        if (findArticle.title === articleTitle) {
            res.send(findArticle)
        } else {
            res.send(`no articles matching that title was found`)
        }

    })

    .put(async (req, res) => {

        const articleTitle = req.params.articleTitle
        const query = { title: articleTitle }
        const option = {
            rawResult:true
        }
        const replaceArticle = await Article.findOneAndReplace(
            query,
            {
                title: req.body.title,
                content:req.body.content
            },
            option
        ).exec()

        if (replaceArticle.lastErrorObject.updatedExisting===true) {
            console.log(`article successfully replace`);
        } else {
            console.log(`cant replace article`);
        }
    })

    .patch(async (req, res) => {

        const articleTitle = req.params.articleTitle
        const query = { title: articleTitle }
        const option = {
            rawResult:true
        }

        const updateArticle = await Article.findOneAndUpdate(
            query,
            {
                title: req.body.title,
                content:req.body.content
            },
            option
        ).exec()

        if (updateArticle.lastErrorObject.updatedExisting===true) {
            console.log(`article successfully updated`);
        } else {
            console.log(`cant update article`);
        }
        
    })

    .delete(async (req, res) => {

        const articleTitle = req.params.articleTitle
        // console.log(articleTitle);
        const query = { title: articleTitle }
        const option = {
            rawResult:true
        }

        const deleteArticle = await Article.findOneAndDelete(
            query,
            option
        )
            .exec()
        
        if (deleteArticle.value!=null) {
            console.log(`${deleteArticle.value.title} article successfully deleted`);
        } else {
            console.log(`cant delete article`);
        }
    })

connDB().then(() => {
    app.listen(PORT, () => {
        console.log(`listening for request ${PORT}`);
    })
})