import PDFDocument from "pdfkit";
import ExcelJS from "exceljs";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { WritableStreamBuffer } from "stream-buffers";
import OpenAI from "openai";

export interface GeneratedFile {
  buffer: Buffer;
  contentType: string;
  filename: string;
  isDownloadable: boolean;
}

export class FileGenerator {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Genera una imagen usando DALL-E
   */
  async generateImage(prompt: string): Promise<GeneratedFile> {
    try {
      const response = await this.openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
      });

      const imageData = response.data?.[0];
      if (!imageData?.b64_json) {
        throw new Error("No se pudo generar la imagen");
      }

      const buffer = Buffer.from(imageData.b64_json, "base64");

      return {
        buffer,
        contentType: "image/png",
        filename: `imagen_${Date.now()}.png`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando imagen:", error);
      throw new Error("No se pudo generar la imagen");
    }
  }

  /**
   * Genera un archivo PDF
   */
  async generatePDF(content: string): Promise<GeneratedFile> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const stream = new WritableStreamBuffer();

        doc.pipe(stream);

        // Configurar el documento
        doc.fontSize(12);
        doc.font("Helvetica");

        // Procesar el contenido línea por línea
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          if (line.trim() === "") {
            doc.moveDown(0.5);
          } else if (line.startsWith("# ")) {
            // Título principal
            doc.fontSize(18).font("Helvetica-Bold");
            doc.text(line.substring(2));
            doc.moveDown(1);
            doc.fontSize(12).font("Helvetica");
          } else if (line.startsWith("## ")) {
            // Subtítulo
            doc.fontSize(14).font("Helvetica-Bold");
            doc.text(line.substring(3));
            doc.moveDown(0.5);
            doc.fontSize(12).font("Helvetica");
          } else if (line.startsWith("### ")) {
            // Sub-subtítulo
            doc.fontSize(13).font("Helvetica-Bold");
            doc.text(line.substring(4));
            doc.moveDown(0.5);
            doc.fontSize(12).font("Helvetica");
          } else if (line.startsWith("- ") || line.startsWith("* ")) {
            // Lista
            doc.text(`• ${line.substring(2)}`);
            doc.moveDown(0.3);
          } else if (line.startsWith("```")) {
            // Código
            doc.font("Courier");
            doc.fontSize(10);
            doc.text(line.substring(3));
            doc.moveDown(0.3);
            doc.font("Helvetica");
            doc.fontSize(12);
          } else {
            // Texto normal
            doc.text(line);
            doc.moveDown(0.5);
          }
        });

        doc.end();

        stream.on("finish", () => {
          const buffer = stream.getContents();
          if (buffer) {
            resolve({
              buffer: Buffer.from(buffer),
              contentType: "application/pdf",
              filename: `documento_${Date.now()}.pdf`,
              isDownloadable: true,
            });
          } else {
            reject(new Error("No se pudo generar el PDF"));
          }
        });

        stream.on("error", reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Genera un archivo Excel
   */
  async generateExcel(content: string): Promise<GeneratedFile> {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Datos");

      // Parsear el contenido como CSV o tabla
      const lines = content.trim().split("\n");

      lines.forEach((line, rowIndex) => {
        if (line.trim()) {
          // Dividir por comas, tabs o pipes
          const cells = line.split(/[,|\t]/).map((cell) => cell.trim());
          worksheet.addRow(cells);
        }
      });

      // Auto-ajustar columnas
      worksheet.columns.forEach((column) => {
        if (column.eachCell) {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, (cell) => {
            const columnLength = cell.value ? cell.value.toString().length : 10;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(maxLength + 2, 50);
        }
      });

      const buffer = await workbook.xlsx.writeBuffer();

      return {
        buffer: Buffer.from(buffer),
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `datos_${Date.now()}.xlsx`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando Excel:", error);
      throw new Error("No se pudo generar el archivo Excel");
    }
  }

  /**
   * Genera un archivo Word (DOCX)
   */
  async generateDOCX(content: string): Promise<GeneratedFile> {
    try {
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: content,
                    size: 24, // 12pt
                  }),
                ],
              }),
            ],
          },
        ],
      });

      const buffer = await Packer.toBuffer(doc);

      return {
        buffer,
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename: `documento_${Date.now()}.docx`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando DOCX:", error);
      throw new Error("No se pudo generar el archivo Word");
    }
  }

  /**
   * Genera un archivo JSON
   */
  generateJSON(content: string): GeneratedFile {
    try {
      // Intentar parsear como JSON válido
      let jsonContent;
      try {
        jsonContent = JSON.parse(content);
      } catch {
        // Si no es JSON válido, crear un objeto con el contenido
        jsonContent = { content: content };
      }

      const buffer = Buffer.from(JSON.stringify(jsonContent, null, 2), "utf8");

      return {
        buffer,
        contentType: "application/json",
        filename: `datos_${Date.now()}.json`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando JSON:", error);
      throw new Error("No se pudo generar el archivo JSON");
    }
  }

  /**
   * Genera un archivo CSV
   */
  generateCSV(content: string): GeneratedFile {
    try {
      const buffer = Buffer.from(content, "utf8");

      return {
        buffer,
        contentType: "text/csv",
        filename: `datos_${Date.now()}.csv`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando CSV:", error);
      throw new Error("No se pudo generar el archivo CSV");
    }
  }

  /**
   * Genera un archivo de texto plano
   */
  generateTXT(content: string): GeneratedFile {
    try {
      const buffer = Buffer.from(content, "utf8");

      return {
        buffer,
        contentType: "text/plain",
        filename: `archivo_${Date.now()}.txt`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando TXT:", error);
      throw new Error("No se pudo generar el archivo de texto");
    }
  }

  /**
   * Genera un archivo Markdown
   */
  generateMarkdown(content: string): GeneratedFile {
    try {
      const buffer = Buffer.from(content, "utf8");

      return {
        buffer,
        contentType: "text/markdown",
        filename: `documento_${Date.now()}.md`,
        isDownloadable: true,
      };
    } catch (error) {
      console.error("Error generando Markdown:", error);
      throw new Error("No se pudo generar el archivo Markdown");
    }
  }

  /**
   * Genera un archivo según el tipo especificado
   */
  async generateFile(
    type: string,
    content: string,
    imagePrompt?: string
  ): Promise<GeneratedFile> {
    const normalizedType = type.toLowerCase().trim();

    switch (normalizedType) {
      case "image":
      case "image/png":
      case "image/jpeg":
      case "image/jpg":
        if (!imagePrompt) {
          throw new Error("Se requiere un prompt para generar imágenes");
        }
        return await this.generateImage(imagePrompt);

      case "pdf":
        return await this.generatePDF(content);

      case "excel":
      case "xlsx":
        return await this.generateExcel(content);

      case "docx":
      case "word":
        return await this.generateDOCX(content);

      case "json":
        return this.generateJSON(content);

      case "csv":
        return this.generateCSV(content);

      case "txt":
      case "text":
        return this.generateTXT(content);

      case "md":
      case "markdown":
        return this.generateMarkdown(content);

      default:
        throw new Error(`Tipo de archivo no soportado: ${type}`);
    }
  }
}
