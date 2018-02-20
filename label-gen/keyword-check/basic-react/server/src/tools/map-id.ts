import { connectDb, ProjectSchema } from "../nlp-db";

connectDb(async (contents, projects) => {
    console.log("run");
    contents
        .find({ id: { $regex: /^\d+\/post$/ } })
        .forEach((e) => {
            // console.log("e", e);
            e.id = "pantip/" + e.id;
            contents.save(e);
        }, (err) => {
            console.log("done with error", err);
        });
});
