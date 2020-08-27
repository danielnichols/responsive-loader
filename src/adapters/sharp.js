// @flow

const sharp = require("sharp");

type Kernels = "nearest"|"cubic"|"mitchell"|"lanczos2"|"lanczos3";

type Options = { background?: number, quality: number, kernel?: Kernels };

type Parameters = {
  width: number,
  mime: string,
  options: Options,
};

module.exports = (imagePath: string) => {
  const image = sharp(imagePath);

  return {
    metadata: () => image.metadata(),
    resize: ({
      width,
      mime,
      options,
    }: Parameters): Promise<{ width: number, height: number, data: Buffer }> =>
      new Promise((resolve, reject) => {
        let resized = image.clone().resize({width, kernel: options.kernel});

        if (options.background) {
          resized = resized.flatten({
            background: options.background,
          });
        }

        if (mime === "image/jpeg") {
          resized = resized.jpeg({
            quality: options.quality,
          });
        }
        if (mime === "image/webp") {
          resized = resized.webp({
            quality: options.quality,
          });
        }

        resized.toBuffer((err, data, { height }) => {
          if (err) {
            reject(err);
          } else {
            resolve({
              data,
              width,
              height,
            });
          }
        });
      }),
  };
};
