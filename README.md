# Cathedral Minecraft Server + Webservice
> play.cathedralresearch.com

brain vomit:
ok so this works:
give @p written_book[written_book_content={title:"test",author:"test",pages:['"test"','"test 2"']}] 1

these also work:
`data get block 4 68 32 Items`

`data modify block 4 68 32 Items append value {count: 1, Slot: 0b, id: "minecraft:oak_log"}`

not specifying the slot just replaces the first slot:
`data modify block 4 68 32 Items append value {count: 1, id: "minecraft:oak_log"}`

this does nothing
`data modify block 4 68 32 Items insert 0 value {count: 1, id: "minecraft:oak_log"}`

interesting. this just gives an error but it indicates
that it just auto-fills the slot  as 0b.
`data modify block 4 68 32 Items merge value {count: 1, id: "minecraft:oak_log"}`

OK THIS ACTUALLY WORKS
`data modify block 4 68 32 Items append value {count: 1, Slot: 1b, components: {"minecraft:written_book_content": {pages: [{raw: '"test"'}, {raw: '"test 2"'}], author: "test", title: {raw: "test"}}}, id: "minecraft:written_book"}`

ok lecterns are goated
`data modify block 5 68 32 Book set value {count: 1, Slot: 1b, components: {"minecraft:written_book_content": {pages: [{raw: '"hello"'}], author: "test", title: {raw: "hello"}}}, id: "minecraft:written_book"}`

this works:
`data modify block 5 69 32 front_text.messages[0] set value '"Updated text"'`

`data modify block 5 69 32 front_text.messages set value ['"new line 1"', '"new line 2"', '""', '""']`

todo:
- [ ] build a small church like the one at the dolomites
- [ ] make a queue system so the church contains the last 10 posts
- [ ] world protection
- [ ] pentest
  - [ ] direct minecraft webhook connection
  - [ ] non https api connection
- [ ] github to api authentication
- [ ] deployment pipeline
- [ ] replace servertap with bash wrapper

  adventure mode? worldguard? command block? protect spawn?


deploy:
scp -r src root@192.3.73.161:~/api/
scp package.json root@192.3.73.161:~/api/
scp tsconfig.json root@192.3.73.161:~/api/
ensure .env file is good
ensure minecraft tmux pane is on
