import express from "express"
import runGraph from "./ai/graph.ai.js"
import cors from "cors"

const app = express()



app.use(express.json())

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}))
app.get("/",async(req,res)=>{
    const result = await runGraph("What is the capital of france")
    res.json(result)
})

app.post("/invoke",async(req,res)=>{
    const {input} = req.body
    const result  = await runGraph(input)

    res.status(201).json({
        message:"Graph Exectuted Successfully",
        success: true,
        result
    })
})



export default app