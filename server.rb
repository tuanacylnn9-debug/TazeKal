require 'webrick'

port = 3000
root = File.expand_path(File.dirname(__FILE__))

puts "-------------------------------------------------------"
puts "  TazeKal — Mobil Arayüz Sunucusu Başlatılıyor..."
puts "  Adres: http://localhost:#{port}"
puts "  Kök Dizin: #{root}"
puts "-------------------------------------------------------"

server = WEBrick::HTTPServer.new(
  Port: port,
  DocumentRoot: root,
  BindAddress: '127.0.0.1',
  AccessLog: [],
  Logger: WEBrick::Log.new(File::NULL)
)

trap('INT') { server.shutdown }
trap('TERM') { server.shutdown }

server.start
