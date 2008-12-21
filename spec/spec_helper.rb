require 'rubygems'
require 'spec'

APP_ROOT = File.expand_path(File.dirname(__FILE__)) + '/../' unless defined? APP_ROOT


require "#{APP_ROOT}/models/init_from_path.rb"
require "#{APP_ROOT}/models/document.rb"
require "#{APP_ROOT}/models/directory.rb"