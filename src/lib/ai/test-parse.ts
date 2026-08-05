import "dotenv/config";
import { parseSessionText } from "./parse";

async function main() {
    const result = await parseSessionText(`
        Played a match against Marco on clay today, lost 4-6 3-6. Serve was a disaster, double faulted a ton. 
        Forehand felt great though. Coach said to toss the ball higher on serve. 
        About an hour and a half, felt pretty tired.`,
    );
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
