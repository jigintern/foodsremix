/*
forked from npm派 https://github.com/jigintern/Foodmates-server/blob/master/models/gorm.go

mysql -uroot -p
[dbrootpass]
create database [dbname];
create user '[dbuser]'@'localhost' identified by '[dbpass]';
grant all on *.* to '[dbuser]'@'localhost';
GRANT ALL PRIVILEGES ON [dbname].* TO '[dbuser]]'@'localhost';
exit

cat > .env <<EOF
MYSQL_USER=[dbuser]
MYSQL_PASSWORD=[dbpass]
MYSQL_DATABASE=[dbname]
EOF

go get github.com/go-sql-driver/mysql
go get github.com/jinzhu/gorm
go get github.com/joho/godotenv

go run fooddb.go
*/

package main

import (
	"fmt"
	"os"
	"time"
	"errors"
	"github.com/jinzhu/gorm"
	"github.com/joho/godotenv"
	_ "github.com/go-sql-driver/mysql"
)

type Food struct {
	ID        int       `gorm:"primary_key" json:"id"`
	CreatedAt time.Time `json:"created_at"`
	Name      string    `gorm:"default:''" json:"name"`
	Price     int       `json:"price"`
	URL       string    `json:"url"`
}

var db *gorm.DB

func InitDB() {
	USER := os.Getenv("MYSQL_USER")
	PASS := os.Getenv("MYSQL_PASSWORD")
	PROTOCOL := ""
	DBNAME := os.Getenv("MYSQL_DATABASE")
	CONNECT := USER + ":" + PASS + "@" + PROTOCOL + "/" + DBNAME + "?charset=utf8mb4&parseTime=True&loc=Local"

	var err error
	db, err = gorm.Open("mysql", CONNECT) // github.com/go-sql-driver/mysql
	if err != nil {
		panic(err.Error())
	}
	db.LogMode(true)
	db.AutoMigrate(&Food{})
}
func TruncateTables() {
	rows, err := db.Raw("SHOW TABLES").Rows()
	if err != nil {
		panic(err.Error())
	}
	defer rows.Close()
	for rows.Next() {
		var table string
		if err := rows.Scan(&table); err != nil {
			panic(err.Error())
		}
		db.Exec("TRUNCATE TABLE " + table)
	}
}
func GetDB() (*gorm.DB, error) {
	if db == nil {
		return nil, errors.New("can't get database")
	}
	return db, nil
}
func Finalize() error {
	err := db.Close()
	return err
}
func ShowAllFoods() {
	db, err := GetDB()
	if err != nil {
		fmt.Println(err)
		return
	}
	var foods []Food
	db.Table("Foods").Find(&foods)
	fmt.Println(foods)
}
func AddFood(name string, price int, url string) error {
	db, err := GetDB()
	if err != nil {
		return err
	}
	db.Create(&Food{ Name: name, Price: price, URL: url, CreatedAt: time.Now() })
	return nil
}
func main() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Error loading .env file")
		return
	}
	InitDB()
	TruncateTables()
	AddFood("サラダ焼", 120, "https://www.sanrokusyoten-316.co.jp/products.html")
	AddFood("サバエドッグ", 280, "https://www.meat-sasaki.com")
	AddFood("眼鏡堅麺麭", 864, "http://echizen-yumekobo.com/?pid=52337987")
	ShowAllFoods()
}
