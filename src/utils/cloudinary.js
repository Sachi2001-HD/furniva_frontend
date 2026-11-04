// Optimize Cloudinary images for the web

export const optimizeImage = (url, width = 800) =>
  url && url.includes("/upload/")
    ? url.replace("/upload/", `/upload/w_${width},q_auto,f_auto/`)
    : url;