require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/directories/show.html.erb" do
  include DirectoriesHelper
  
  before(:each) do
    assigns[:directory] = @directory = stub_model(Directory)
  end

  it "should render attributes in <p>" do
    render "/directories/show.html.erb"
  end
end

