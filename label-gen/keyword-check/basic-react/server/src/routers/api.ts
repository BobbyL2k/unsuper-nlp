import * as express from "express";
import * as fs from "fs";

export type ProjectIndex = Array<{
    A_ID: string,
    C_PROJECT_NAME: string,
    labelCount: number,
    totalCount: number,
}>;

const router = express.Router();

const projectIndex: { [key: string]: object } = JSON.parse(
    fs.readFileSync(
        __dirname +
        "/" +
        "./../../../../../../data/json/parsed/homedottech.json",
    ).toString());
const projectIndexEntries: ProjectIndex = [];
for (const key in projectIndex) {
    if (projectIndex.hasOwnProperty(key)) {
        const entry: any = projectIndex[key];
        projectIndexEntries.push({
            A_ID: entry.A_ID,
            C_PROJECT_NAME: entry.C_PROJECT_NAME,
            labelCount: 0,
            totalCount: 0,
        });
    }
}

// router.use((req, res, next) => {
//     console.log("API called");
//     next();
// });

router.get("/project-index", (req, res) => {
    res.send(projectIndexEntries);
});

router.get("/project/:projectId", (req, res) => {
    console.log("projectId", req.params.projectId);
    res.send([{
        matchId: "matchId-string0 " + req.params.projectId,
        title: "title-string",
        source: "source-string",
        labeled: false,
    }, {
        matchId: "matchId-string1 " + req.params.projectId,
        title: "title-string",
        source: "source-string",
        labeled: false,
    }]);
});

router.get("/data/match/:matchId", (req, res) => {
    console.log("projectId", req.params.matchId);
    res.send({
        data: {
            dataId: "dataId string",
            title: "Title string",
            content: "ต้องขอออกตัวก่อนนะคะ เป็นกระทู้แรก รู้สึกทำอะไรไม่ถูกเลยเกี่ยวกับบ้านหลังแรกของเราเลยอยากมาขอปรึกษา\n\nเริ่มจากเรากับแฟนมองหาบ้านหลังนึง ที่ใกล้บ้านพ่อแม่เราทั้งสองคนค่ะ เลยมาเจอโครงการนี้ค่ะ ตั้งอยู่ห่างจากบ้านเดิมประมาณ 5 กม. ยอมรับเลยว่า บ้านสวย ถูกใจเราสองคนมากกก หน้าบ้านเป็นสวน บ้านหันหน้าทางทิศใต้ ลมเข้าตลอด บ้านเย็น เพราะใช้อิฐมวลเบา  เซลบอกมาค่ะ เอ๊ะ..ลืมบอก เซลชื่อ พี่ป้ายค่ะ (นามสมมติ) คุณแฟนเลยบอกเซลว่า เดี๋ยวอาทิตย์หน้าจะพาคุณพ่อเข้ามาดู พี่ป้ายก็โอเค พอผ่านไป3วัน  พี่ป้ายโทรมาว่ามีคนซื้อไปแล้วนะ เราสองคนเคว้งมาก นั่งหาบ้านกันมาตั้งหลายเดือน มาเจอบ้านที่ถูกใจ แต่มีคนอื่นเอาไปแล้ว...\nวันถัดมาคุณแฟนพาคุณพ่อเข้าไปโครงการด้วย คุณพ่อแฟนมาถูกใจอีกหลังนึง เป็นบ้านหลังมุม หน้าบ้านเปนสวน แต่เล็กมากค่ะ แทบไม่ใช่สวน เพราะมีหญ้าแปะอยู่นิดเดียว และเป็นกำแพงท้ายโครงการค่ะ คุณแฟนไม่โอเคเท่าไหร่ แต่คุณพ่อบอกว่าโอเค เลยแจ้งพี่ป้ายว่า วันอาทิตย์จะพาเราเข้ามาดูก่อน \n\nพอถึงวันอาทิตย์เรากับแฟนก็เข้าไปดูหลังที่คุณพ่อแฟนชอบค่ะ ความรู้สึกส่วนตัวไม่ได้ชอบเท่าไหร่ แต่บ้านหลังนี้ใหญ่กว่าหลังที่เราสองคนถูกใจ แถมราคาแพงกว่า 2ล้านค่ะ เรากับแฟนก็เดินทั่วบ้านเลยค่ะ พยายามดูว่าใช่สำหรับเราสองคนไหม ระหว่างนั้นโทรศัพท์พี่ป้ายดังค่ะ ปลายสายที่โทรมา คือคนที่สนใจบ้านหลังที่กำลังยืนอยู่เหมือนกัน ช่วงบ่ายจะพาญาติเข้ามาดู \nเอาแล้วไงค่ะ คุณแฟนได้ยินก็เริ่มร้อนใจ เอายังไงดี ก็ไม่ได้ชอบเท่าไหร่ แต่หลังอื่นที่โอเคก็ขายไปแล้ว โครงการนี้สร้างเสร็จก่อนค่อยขายนะค่ะ คุณแฟนเลยโทรไปหาคุณพ่อค่ะ แต่ยังไม่ตัดสินใจ  ระหว่างที่เซลวนรถกอล์ฟกลับสำนักงานขาย ดันผ่ายซอยที่กำลังสร้างอยู่ค่ะ เค้าปิดประตูไม่ให้เข้า แฟนเลยให้พี่ป้ายพาเข้าไปดู ขับเข้ามาเรื่อยๆ หลังที่3 เจอหลังที่เหมือนกับหลังแรกที่เรากับแฟนถูกใจ บ้านหลังนี้ยังสร้างไม่เสร็จนะค่ะ ขนาดบ้านเท่ากัน หน้าบ้านเป็นสวนเหมือนกัน ถูกใจมากเลยค่ะ แฟนตัดสินใจทันทีว่าเอาบ้านหลังนี้ เลยตกลงวางเงินจองจำนวน 5หมื่นค่ะ \n\nหลังจากนั้นเราสองคนก็เข้ามาทุกอาทิตย์ เพื่อมาดูความคืบหน้า แทบเฝ้ารอเลยค่ะ ว่าเมื่อไหร่จะเสร็จในช่วงแรกโครงการมีสังกะสีบังไม่ให้ฝุ่นไปถูกบ้านที่มีลูกค้าอาศัยอยู่แล้ว",
            source: "Source string",
        },
        project: {
            projectId: "projectId string",
            projectName: "projectName string",
        },
        match: {
            matchId: "matchId string" + req.params.matchId,
            start: 0,
            end: 7,
        },
        validation: [
            { userId: "user1", isValid: true },
            { userId: "user2", isValid: false },
        ],
    });
});

export default router;
