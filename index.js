const express = require("express")
const mysql = require("mysql2/promise")
const app = express()

app.use(express.json())

//db = DATABASE
const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "root",
    port: 3307,
    database: "escola"
})

//Professores
app.get("/professores", async (req, res) => {
    try {
        const [professores] = await db.execute("SELECT * FROM professores")
        return res.json(professores)
    } catch (error) {
        console.error("Erro ao buscar professores:", error)
        return res.status(500).json({ error: "Erro ao buscar professores" })
    }
})

app.post("/professores", async (req, res) => {
    const { nome } = req.body ?? {}
    if (typeof nome !== "string" || !nome.trim()) {
        return res.status(400).json({ error: "Nome não informado" })
    }
    const nomeNormalizado = nome.trim()
    if (nomeNormalizado.length <= 2) {
        return res.status(400).json({ error: "Nome muito curto" })
    }

    try {
        const [resultado] = await db.execute("INSERT INTO professores (nome) VALUES (?)", [nomeNormalizado])
        return res.status(201).json({ id: resultado.insertId, nome: nomeNormalizado })
    } catch (error) {
        console.error("Erro ao cadastrar professor:", error)
        return res.status(500).json({ error: "Erro ao cadastrar professor" })
    }
})

app.post("/cursos", async (req, res) => {
    const { nome, professor_id } = req.body ?? {}
    if (typeof nome !== "string" || !nome.trim()) {
        return res.status(400).json({ error: "Nome não informado" })
    }
    if (!Number.isInteger(professor_id) || professor_id <= 0) {
        return res.status(400).json({ error: "Professor id inválido" })
    }
    const nomeNormalizado = nome.trim()

    try {
        const [resultado] = await db.execute(
            "INSERT INTO cursos (nome, id_professor) VALUES (?, ?)",
            [nomeNormalizado, professor_id]
        )
        return res.status(201).json({ id: resultado.insertId, nome: nomeNormalizado, professor_id })
    } catch (error) {
        console.error("Erro ao cadastrar curso:", error)
        return res.status(500).json({ error: "Erro ao cadastrar curso" })
    }
})

app.use((error, req, res, next) => {
    if (error.type === "entity.parse.failed") {
        return res.status(400).json({ error: "JSON inválido" })
    }
    console.error("Erro na requisição:", error)
    return res.status(500).json({ error: "Erro interno do servidor" })
})

app.listen(3000, () => console.log("API no ar :D"))