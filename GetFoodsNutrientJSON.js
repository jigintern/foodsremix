// npm install cheerio-httpcli
// forked from 旬レシピ https://github.com/jigintern/Season-Foods-Navi/blob/develop/server/src/GetFoodsNutrient.js

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

const httpClient = require('cheerio-httpcli')

async function getNutrientById(id) {
    if (!id)
        return null
    const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=" + id
    //console.log(url)

    // HTMLデータを取得
    const result = await httpClient.fetch(url)
    const $ = result.$
    
    const title = $('span.foodfullname').text()

    // HTML内の表の行データを取得して変換してリストに入れる
    const NUTRIENTS = [
        [ "廃棄率" ],
        [ "水分" ],
        
        [ "エネルギー" ],
        [ "たんぱく質" ], // 1g 4kcal
        [ "脂質" ], // 1g 9kcal
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

        [ "単糖当量", "糖質" ], // 1g 4kcal .. 炭水化物 - 食物繊維で計算したほうがいいかも、ビールでTrとしか書いてない

        // 食物繊維
        //[ "水溶性", "水溶性食物繊維" ],
        //[ "不溶性", "不溶性食物繊維" ],
        [ "総量", "食物繊維" ],

        [ "食塩相当量" ], // ナトリウムから計算可？
        [ "アルコール" ]　// 1g 7kcal
    ]
    const nuts = []
    nuts.push({ name: "可食部", value: '100', unit: "g" }) // 固定でOK?
    $('tr', '#nut').filter(function() { return $(this).attr('class') != 'pr_tit' }).each(function() {
        const obj = {}
        const name = $(this).find(".no_under").text()
        for (let nut of NUTRIENTS) {
            if (nut[0] == name) {
                const name2 = nut.length > 1 ? nut[1] : name
                nuts.push({
                    name: name2,
                    value: $(this).find(".num").text(),
                    unit: $(this).find(".pr_unit").text()
                })
                break
            }
        }
    })
    return { id: id, food: title, nutrients: nuts, srcurl: url }
}

function fetchHTTP(url) {
    return new Promise((resolve, reject) => {
        httpClient.fetch(url).then(result => {
            resolve(result.body)
        }).catch(err => {
            reject(err)
        })
    })
}

async function searchNutrient(name) {
    return new Promise(async function(resolve, reject) {
        const result = await httpClient.fetch("https://fooddb.mext.go.jp/freeword/searchbox.pl?CLEAR=1")
        //console.log(result.body)
        const param = {
            SEARCH_WORD: name,
            USER_ID: "",
        }
        result.$('form[id=free_word_search_box]').submit(param, function(err, $, res, body) {
            //console.log(body)
            const list = []
            $('td').each(function() {
                const label = $(this).find("label")
                let id = label.attr("for")
                if (id)
                    id = id.substring(2)
                const name = label.text()
                list.push({ id: id, name: name })
            })
            resolve(list)
        })
    })
}

/*
module.exports = {
    GetFoodsNutrientJSON: GetFoodsNutrientJSON
}
*/

function setTimeoutAsync(delay) {
    return new Promise(function(resolve, reject) {
        setTimeout(() => {
            resolve(300)
        }, delay);
    })
}

/*
setTimeoutAsync(1000)
    .then(function() {
        console.log("func")
    });
*/
/*
(async () => {
    const res = await setTimeoutAsync(1000)
    console.log("ex" + res)
})()
*/

if (!module.parent) {
    /*
    const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=13_13003_7" // 牛乳
    //const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=12_12004_7" // 卵
    //const url = "https://fooddb.mext.go.jp/details/details.pl?ITEM_NO=17_17012_7" // 食塩
    //GetFoodsNutrientJSON(url).then((res) => console.log(res))
    */

//    searchFoodsNutrient("牛乳")

    (async () => {
        //const keyword = "乳類/（液状乳類）/普通牛乳"
        let keyword = "バナナ"
        if (process.argv.length >= 3)
            keyword = process.argv[2]
        const list = await searchNutrient(keyword)
        console.log(list)
        list.forEach(async ele => {
            const res = await getNutrientById(ele.id)
            console.log(res)
        })
//        const res = await fetchHTTP("https://fukuno.jig.jp/")
//        console.log(res)
    })()
}
