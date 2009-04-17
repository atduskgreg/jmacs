require "rubygems"
require 'sinatra'
require 'json'

require File.expand_path(File.dirname(__FILE__)) + "/../models/init_from_path.rb"
require File.expand_path(File.dirname(__FILE__)) + "/../models/document.rb"
require File.expand_path(File.dirname(__FILE__)) + "/../models/directory.rb"
require 'spec'