require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/directories/index.html.erb" do
  include DirectoriesHelper
  
  before(:each) do
    assigns[:directories] = [
      stub_model(Directory),
      stub_model(Directory)
    ]
  end

  it "should render list of directories" do
    render "/directories/index.html.erb"
  end
end

