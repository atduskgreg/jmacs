require "rubygems"
require 'sinatra'
require 'json'

APP_ROOT = File.expand_path(File.dirname(__FILE__)) unless defined? APP_ROOT

require "#{APP_ROOT}/models/init_from_path.rb"
require "#{APP_ROOT}/models/document.rb"
require "#{APP_ROOT}/models/directory.rb"

helpers do
  def save_document( params )
    document = load_document( params )
    document.content = params[:content]
    document.save
  end
  
  def load_document( params )
    begin
      Document.new :path => params[:id].gsub(/\\056/, "."), :pwd => params[:pwd]
    rescue Exception => e
      error( e.message )
    end
  end
  
  def ok( object )
    content_type 'application/json'
    "#{params[:callback]}(#{object.to_json})"
  end
  
  def error( message )
    content_type 'application/json'
    message.to_json
  end
end

get '/' do
  open("#{APP_ROOT}/public/index.html").read
end

get '/javascripts/*' do
  open("#{APP_ROOT}/public/javascripts/#{params['splat']}").read
end

get '/documents/:id.json' do
  ok load_document( params )
end

post '/documents' do
  ok save_document( params )
end

put '/documents/:id' do
  ok save_document( params )
end

delete '/documents/:id' do
  document = load_document( params )
  document.destroy
  "#{params[:callback]}({success: true})"
end

get '/directories/:id.json' do
  begin 
    dir = Directory.new :path => params[:id].gsub(/\\056/, "."), :pwd => params[:pwd]
    "#{params[:callback]}(#{dir.to_json})"
  rescue Exception => e
    error e.message
  end
end
