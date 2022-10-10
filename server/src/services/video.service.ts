import { getRandomMemojiImage } from "../helpers/videoUtils";

export async function generateRandomImages(category: "male" | "female") {
  let response = {};
  response = await getRandomMemojiImage(category).then((randomImage) => {
    return randomImage;
  }).catch((err: Error) => {
      console.log(err);
      const error = new Error();
      error.message = `${err}`;
      throw error;
    });

  return response;
}
