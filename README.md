# Cathedral Minecraft Server + Webservice
> play.cathedral.mc

## starting the minecraft server
0. (make sure you're in the root)
1. put server.jar into server/
2. cd minecraft && ./minecraft/startup.sh
3. accept eula, enable rcon, set rcon password
4. ./minecraft/startup.sh

## starting the api
0. (make sure you're in the root)
1. make env file with RCON_PASSWORD and SECRET in api/
2. cd api && bun i && bun run src/index.ts

## server setup
this blocks all external rcon connections:
iptables -A INPUT -p tcp --dport 25575 ! -s 127.0.0.1 -j DROP

-

command to test connectivity:
curl -X POST http://localhost:3000/test

curl -X POST http://localhost:3000/new-post \
  -H "Content-Type: application/json" \
  -d '{
    "author": "test",
    "title": "test",
    "content": "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."
  }'

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
