require "rubygems"
require 'sinatra'
require 'json'

MODEL_ROOT = "/Users/greg/code/jmacs/app/models" unless defined? MODEL_ROOT

require "#{MODEL_ROOT}/init_from_path.rb"
require "#{MODEL_ROOT}/document.rb"
require "#{MODEL_ROOT}/directory.rb"

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
  open("/Users/greg/code/jmacs/public/index.html").read
end

get '/javascripts/*' do
  open("/Users/greg/code/jmacs/public/javascripts/#{params['splat']}").read
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
