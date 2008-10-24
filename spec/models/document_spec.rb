require File.expand_path(File.dirname(__FILE__) + '/../spec_helper')

describe "Document.new" do

  it "should accept a path" do
    d = Document.new( :path => "app/models/document.rb" )
    d.path.should == "app/models/document.rb"
  end
  
  it "should resolve the path relative to the optional pwd" do
    d = Document.new( :path => "app/models/document.rb", :pwd => "/Users/greg/code/jmacs" )
    d.path.should == "/Users/greg/code/jmacs/app/models/document.rb"
  end
end

describe "Document#resolve_path" do
  it "should resolve a funny combo" do
    d = Document.new( :path => "../app/models/document.rb", :pwd => "~/../" )
    d.path.should == "~/../../app/models/document.rb"
  end
  
  it "should just return the path if it is absolute" do
    d = Document.new( :path => "/app/models/document.rb", :pwd => "foobar and frobnitz" )
    d.path.should == "/app/models/document.rb"
  end
  
end