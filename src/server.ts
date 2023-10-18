import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        orderBy: {
            title: "asc",
        },
        include: {
            genres: true,
            languages: true,
        },
    });

    res.json(movies);
});

app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;

    try {
        const movieWidthSameTitle = await prisma.movie.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive",
                },
            },
        });

        if (movieWidthSameTitle) {
            return res
                .status(409)
                .send({ message: "Já existe um filme cadastrado com esse título" });
        }

        await prisma.movie.create({
            data: {
                title: title,
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date),
            },
        });
    } catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar um filme " });
    }

    res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }

        const data = req.body;
        data.release_date = data.release_date
            ? new Date(data.release_date)
            : undefined;

        await prisma.movie.update({
            where: {
                id,
            },
            data: data,
        });

        res.status(200).send();
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Falha ao atualizar o registro do filme" });
    }
});

app.delete("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);

    try {
        const movie = await prisma.movie.findUnique({
            where: {
                id,
            },
        });

        if (!movie) {
            return res.status(404).send({ message: "O filme não foi encontrado" });
        }

        await prisma.movie.delete({
            where: {
                id,
            },
        });
    } catch (error) {
        return res
            .status(500)
            .send({ message: "Não foi possível remover o filme" });
    }

    res.status(200).send();
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
