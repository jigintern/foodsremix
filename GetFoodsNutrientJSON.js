// npm install cheerio-httpcli

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const httpClient = require('cheerio-httpcli')

async function GetFoodsNutrientJSON(url) {
    // HTMLデータを取得
    const result = await httpClient.fetch(url)
    //console.log(url)
    
    const $ = result.$
    const title = $('span.foodfullname').text()
    //Title = $(this).find(".foodfullname").text();
    //console.log(Title)

    // HTML内の表の行データを取得して変換してリストに入れる
    const GetNameList = [
        [ "エネルギー" ],
        [ "たんぱく質" ],
        [ "脂質" ],
        [ "炭水化物" ],

        // ミネラル
        [ "ナトリウム" ],
        [ "カリウム" ],
        [ "カルシウム" ],
        [ "マグネシウム" ],
        [ "リン" ],
        [ "鉄" ],
        [ "亜鉛" ],
        [ "銅" ],
        [ "マンガン" ],
        [ "ヨウ素" ],
        [ "セレン" ],
        [ "クロム" ],
        [ "モリブデン" ],

        // ビタミン
        /*
        "レチノール", // A
        "カロテン", // αとβあり
        "β−クリプトキサンチン",
        "β−カロテン当量",
        */
        [ "レチノール活性当量", "ビタミンA" ],
        [ "D", "ビタミンD" ],
        [ "トコフェロール", "ビタミンE" ], // 注意! αだけになってる
        [ "K", "ビタミンK" ],
        [ "B1", "ビタミンB1" ],
        [ "B2", "ビタミンB2" ],
        // "ナイアシン", 
        [ "ナイアシン当量", "ナイアシン" ], //??
        [ "B6", "ビタミンB6" ],
        [ "B12", "ビタミンB12" ],
        [ "葉酸" ],
        [ "パントテン酸" ],
        [ "ビオチン" ],
        [ "C", "ビタミンC" ],

        // 脂肪酸
        [ "飽和", "飽和脂肪酸" ],
        //"一価不飽和", // 必須ではない
        [ "多価不飽和", "多価不飽和脂肪酸" ], // n-3系脂肪酸＋n-6系脂肪酸？
        [ "コレステロール" ], // 実は必須

        [ "単糖当量", "糖質" ],

        // 食物繊維
        //[ "水溶性", "水溶性食物繊維" ],
        //[ "不溶性", "不溶性食物繊維" ],
        [ "総量", "食物繊維" ],

        [ "食塩相当量" ], // ナトリウムから計算可？
        [ "アルコール" ]
    ]
    const nuts = []
    nuts.push({ name: "可食部", value: '100', unit: "g" }) // 固定でOK?
    $('tr', '#nut').filter(function() { return $(this).attr('class') != 'pr_tit'; }).each(function() {
        const obj = {}
        const name = $(this).find(".no_under").text()
        for (let i = 0; i < GetNameList.length; i++) {
            if (GetNameList[i][0] == name) {
                const name2 = GetNameList[i].length > 1 ? GetNameList[i][1] : name
                nuts.push({
                    name: name2,
                    value: $(this).find(".num").text(),
                    unit: $(this).find(".pr_unit").text()
                })
                break
            }
        }
    })
    //console.log(JSON.stringify(nuts,undefined, 1))
    
    return { food: title, info: nuts }
}
    
module.exports = {
    GetFoodsNutrientJSON: GetFoodsNutrientJSON
}

if (!module.parent) {
    const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=13_13003_7" // 牛乳
    //const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=12_12004_7" // 卵
    //const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=17_17012_7" // 食塩
    GetFoodsNutrientJSON(url).then((res) => console.log(res))
}
