import { connectDb } from "../nlp-db";

connectDb(async (contents, projects) => {
    console.log("run");
    contents
        .find({ id: { $regex: /^pantip\/\d+\/post$/ } })
        .forEach((e) => {
            const id = e.id.split("/").slice(0, 2).join("/") + "/title";
            contents.findOneAndUpdate(
                {
                    id,
                }, {
                    $setOnInsert: {
                        id,
                    },
                    $set: {
                        text: e.info.title,
                        info: e.info,
                    },
                }, {
                    upsert: true,
                }).catch((err) => {
                    console.log("error", err);
                });
        }, (err) => {
            console.log("done with error", err);
        });
});
