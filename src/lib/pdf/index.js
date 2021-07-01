import PdfPrinter from "pdfmake"

export const generatePDFReadableStream = (img,data1,data2) => {
    const fonts = {
        Roboto:{
            normal: "Helvetica",
            bold:"Helvetica-bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-Oblique"
        },
        hello:{
            normal:"src/lib/fonts/hello.ttf"
        }
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content:[
           
              {
                  image:img,
                  width:500
              },
            
                {
                    text:data1,
                    fontSize: 24,
                    font:"hello",
                    alignment:"center",
                    margin:[0,10,0,10]
                }
            ,
            
                 {
                   text:data2,
                   lineHeight:2  
                 }
            
        ]
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
    pdfReadableStream.end()
    return pdfReadableStream
}