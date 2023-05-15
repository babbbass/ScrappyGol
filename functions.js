import Fs from "fs"
import fetch from "node-fetch"

export async function timeout(ms) {
  return new Promise((res) => setTimeout(res, ms))
}

export const downloadImagesProductLinks = async (page, link, teamName) => {
  console.log(`----START download images products ${teamName}------`)
  await page.goto(link)
  await timeout(2000)
  const imageLinks = await page.evaluate(() => {
    let titleProduct = document.querySelector("h1").innerText
    titleProduct = titleProduct.substring(0, titleProduct.indexOf("Item"))

    const LinksImagesOfProduct = {
      title: titleProduct,
      products: [],
    }
    const productsOfPage = document.querySelectorAll(
      "#goodsimagelist a[data_img]"
    )

    productsOfPage.forEach((product) => {
      const image = product.attributes.data_img.nodeValue
      LinksImagesOfProduct.products.push(image.substring(0, image.indexOf("?")))
    })

    return LinksImagesOfProduct
  })

  return imageLinks
}

export const downloadImagesForProduct = async (product, teamName) => {
  let key = 0
  if (!Fs.existsSync(`./images/${teamName}`)) {
    Fs.mkdirSync(`./images/${teamName}`)
  }

  if (Fs.existsSync(`./images/${teamName}/${product.title}`)) {
    console.log(`\n Produit ${product.title} existe déjà\n`)
    return
  }

  Fs.mkdirSync(`./images/${teamName}/${product.title}`)
  for (const link of product.products) {
    console.log(link)
    key++
    const response = await fetch(link)
      .then((res) => {
        const writer = Fs.createWriteStream(
          `./images/${teamName}/${product.title}/${key}.jpg`
        )
        res.body.pipe(writer)
      })
      .catch((err) => {
        console.log(`erreur fetch`)
        return
      })
  }
}

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

export const dwPageProductLinks = async (page) => {
  console.log(`------------recuperation lien----------`)
  const images = await page.evaluate(() => {
    const productLinksArray = []
    const productLinks = document.querySelectorAll(".common_pro_list2 a.pic")
    productLinks.forEach((link) => {
      productLinksArray.push(link.href)
    })

    return productLinksArray
  })

  return images
}

export async function linksTeam(page) {
  const links = await page.evaluate(() => {
    const linksTeamArray = []
    const teamsLinks = document.querySelectorAll(".shopbycate_2 a")
    teamsLinks.forEach((link) => {
      linksTeamArray.push({
        teamName: link.innerText,
        link: link.href,
      })
    })

    return linksTeamArray
  })

  return links
}

export const nbPageByProduct = async (page) => {
  const numberPage = await page.evaluate(() => {
    const number = document.querySelectorAll(
      ".common_pages a:not(.cur):not(.next)"
    ).length

    return number
  })

  return numberPage
}
