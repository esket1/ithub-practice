<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<xsl:template match="/">
  <html>
  <head>
    <style>
      table { border-collapse: collapse; width: 100%; font-family: sans-serif; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      h2 { font-family: sans-serif; }
    </style>
  </head>
  <body>
    <h2>Отчет по просроченным книгам</h2>
    <table>
      <tr>
        <th>ID Выдачи</th>
        <th>Инвентарный номер</th>
        <th>Название</th>
        <th>Читательский билет</th>
        <th>Дата выдачи</th>
      </tr>
      <xsl:for-each select="OverdueReport/Loan">
      <tr>
        <td><xsl:value-of select="LoanId"/></td>
        <td><xsl:value-of select="InventoryNumber"/></td>
        <td><xsl:value-of select="Title"/></td>
        <td><xsl:value-of select="ReaderCard"/></td>
        <td><xsl:value-of select="DateTaken"/></td>
      </tr>
      </xsl:for-each>
    </table>
  </body>
  </html>
</xsl:template>
</xsl:stylesheet>