const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

//Schemas can be nested
const ImageSchema = new Schema({
  url: String,
  filename: String,
});

//virtual property is not stored in Mongo, do this calc when queried
ImageSchema.virtual("thumbnail").get(function () {
  // @ts-ignore
  return this.url.replace("/upload", "/upload/w_200");
});

//Mongoose default not passing virtual into JSON, need to be set specifically
const opts = { toJSON: { virtuals: true } };

const CampgroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

CampgroundSchema.virtual("properties.popUpMarkUp").get(function () {
  // @ts-ignore
  return `
  <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

// delete associated reviews after camp is deleted
// query middleware
CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampgroundSchema);
