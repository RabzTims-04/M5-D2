import PdfPrinter from "pdfmake"

export const generatePDFReadableStream = (img,data1,data2) => {
    const fonts = {
        Roboto:{
            normal: "Helvetica",
            bold:"Helvetica-bold",
            italics: "Helvetica-Oblique",
            bolditalics: "Helvetica-Oblique"
        }
    }

    const printer = new PdfPrinter(fonts)

    const docDefinition = {
        content:[
            {
                image: img,
                width: 50,
                height: 50
            },
            
                data1
            ,
            
                 data2 
            
        ]
    }

    const pdfReadableStream = printer.createPdfKitDocument(docDefinition)
    pdfReadableStream.end()
    return pdfReadableStream
}