require File.expand_path(File.dirname(__FILE__) + '/../../spec_helper')

describe "/documents/index.html.erb" do
  include DocumentsHelper
  
  before(:each) do
    assigns[:documents] = [
      stub_model(Document),
      stub_model(Document)
    ]
  end

  it "should render list of documents" do
    render "/documents/index.html.erb"
  end
end

