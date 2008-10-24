require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/documents/show.html.erb" do
  include DocumentsHelper
  
  before(:each) do
    assigns[:document] = @document = stub_model(Document)
  end

  it "should render attributes in <p>" do
    render "/documents/show.html.erb"
  end
end

